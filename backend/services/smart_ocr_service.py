"""
🤖 Smart OCR Language Detection Service

Multi-stage language detection with confidence scoring for better OCR results.

Stage 1: Script Detection (OSD) - Fast initial screening
Stage 2: Sample OCR - Extract sample text with candidate languages
Stage 3: Statistical Analysis - N-gram and character frequency
Stage 4: Confidence Scoring - Weighted scoring with fallback logic
"""

import re
import pytesseract
from PIL import Image
from collections import Counter
import logging

logger = logging.getLogger(__name__)

# Language n-gram profiles for statistical detection
LANGUAGE_NGRAMS = {
    'en': {
        'trigrams': ['the', 'and', 'ing', 'ion', 'ent', 'for', 'hat', 'thi', 'was', 'with', 'are', 'his', 'her'],
        'quadgrams': ['tion', 'eing', 'that', 'with', 'ing', 'ment', 'ther', 'from', 'have', 'this'],
        'common': 'etaoinshrdlucmwfgypbvkxjq',
    },
    'es': {
        'trigrams': ['que', 'del', 'ión', 'los', 'las', 'con', 'por', 'para', 'una', 'des', 'ada', 'ión'],
        'quadgrams': ['ción', 'ente', 'ción', 'ques', 'tion', 'de la', 'del ', ' los'],
        'common': 'eaosrnidlcpumtvgbqhfzñ',
    },
    'fr': {
        'trigrams': ['ion', 'ent', 'les', 'des', 'tion', 'ement', 'la', 'le', 'et', 'est', 'que', 'our'],
        'quadgrams': ['tion', 'ement', 'ques', 'ette', 'tion', 'ement', 'ière', 'onde', 'pour', 'dans'],
        'common': 'esaitnrulodcpmévqfhgbzjàâäéèêëïîôùûüç',
    },
    'de': {
        'trigrams': ['ung', 'sch', 'ich', 'den', 'die', 'und', 'ein', 'keit', 'lich', 'ten', 'gen'],
        'quadgrams': ['ung', 'sch', 'keit', 'lich', 'gen', 'heit', 'sung', 'sch', 'tion', 'dass'],
        'common': 'enirstaudlgcmphobvfkzwjäöüß',
    },
    'pt': {
        'trigrams': ['ção', 'men', 'de', 'que', 'os', 'as', 'por', 'com', 'não', 'para', 'ção'],
        'quadgrams': ['ção', 'ente', 'ção', 'ques', 'dade', 'ção', 'ento', 'ação', ' para'],
        'common': 'aãêéíõóúâôç',
    },
    'it': {
        'trigrams': ['ione', 'zione', 'are', 'ere', 'ire', 'gli', 'che', 'per', 'una', 'del'],
        'quadgrams': ['ione', 'zione', 'zione', 'ione', 'zione', 'ente', 'ione', 'amento'],
        'common': 'aeiouilndrstcmopgvbzfqhkjxwy',
    },
    'ru': {
        'trigrams': ['ов', 'овн', 'ани', ' ен', 'ии', 'ост', 'тел', 'ьн', 'про', 'стр', 'ова'],
        'quadgrams': ['ова', 'ений', 'ство', 'ова', 'нной', 'рован'],
        'common': 'оеаинтрслвпдмкрупбзчйхцшщъыьэюя',
    },
    'zh': {
        'trigrams': ['的', '是', '了', '不', '在', '人', '有', '我', '这', '个', '们', '来'],
        'quadgrams': ['的是', '不了', '我在', '人们', '这个', '我们', '中国', '是的'],
        'common': '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面',
        'is_cjk': True,
    },
    'ja': {
        'trigrams': ['の', 'に', 'は', 'を', 'た', 'で', 'が', 'と', 'し', 'て', 'いる'],
        'quadgrams': ['ので', 'には', 'と ', 'で ', 'は ', 'ので', 'に ', 'の '],
        'common': 'のいうはれたりでがくとそしめた',
        'is_cjk': True,
    },
    'ko': {
        'trigrams': ['의', '이', '에', '는', '을', '가', '하', '고', ' 있', ' 수'],
        'quadgrams': ['있는', '에서', '으로', '하는', '것이', '있습니다', '입니다'],
        'common': '이다omethaneointusrclhkpgybvqxfzwj',
        'is_cjk': True,
    },
    'ar': {
        'trigrams': ['ال', ' في', ' لا', ' على', ' من', ' إنه', ' مع', ' عن'],
        'quadgrams': ['التي', 'الذي', 'الة', ' على ', ' في ال', ' من ', 'ذلك'],
        'common': 'الطريقةالعربيةفيمنهعلى',
        'is_rtl': True,
    },
    'hi': {
        'trigrams': ['ी', 'ा', 'े', 'ो', 'न', 'र', 'है', 'से', 'क', 'लि', 'ति'],
        'quadgrams': ['हैं', 'था', 'होगा', 'करने', 'किए', 'जो ', 'ने ', 'से '],
        'common': 'करणस्थपतिव्यक्तजनस्वदेभभगौकवनयदरथकपालमनमुशकि',
        'is_indic': True,
    },
}

# Script patterns for detection
SCRIPT_PATTERNS = {
    'latin': r'[a-zA-Zà-ÿÀ-ß]',
    'cyrillic': r'[а-яА-ЯёЁ]',
    'cjk': r'[\u4e00-\u9fff\u3400-\u4dbf]',
    'japanese_hiragana': r'[\u3040-\u309f]',
    'japanese_katakana': r'[\u30a0-\u30ff]',
    'korean': r'[가-힣]',
    'arabic': r'[\u0600-\u06ff\u0750-\u077f]',
    'devanagari': r'[\u0900-\u097f]',
    'bengali': r'[\u0980-\u09ff]',
    'tamil': r'[\u0b80-\u0bff]',
    'thai': r'[\u0e00-\u0e7f]',
    'greek': r'[\u0370-\u03ff]',
    'hebrew': r'[\u0590-\u05ff]',
}

# Script to language mapping
SCRIPT_TO_LANGUAGES = {
    'latin': ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'cs', 'da', 'fi', 'hu', 'ro', 'sk', 'sl', 'sv', 'tr', 'vi', 'id', 'ca', 'eu', 'gl', 'lt', 'lv', 'et'],
    'cyrillic': ['ru', 'ukr', 'bul', 'bel', 'srp', 'mkd', 'kaz', 'uzb', 'tgk', 'kir', 'mon'],
    'cjk': ['chi_sim', 'chi_tra'],
    'japanese_hiragana': ['jpn'],
    'japanese_katakana': ['jpn'],
    'korean': ['kor'],
    'arabic': ['ara', 'fas', 'urd', 'pus', 'div', 'snd'],
    'devanagari': ['hin', 'mar', 'nep', 'san', 'bod', 'kas', 'mai'],
    'bengali': ['ben', 'asm'],
    'tamil': ['tam'],
    'thai': ['tha'],
    'greek': ['ell'],
    'hebrew': ['heb'],
}

# Extended language names
LANGUAGE_NAMES = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
    'pt': 'Portuguese', 'it': 'Italian', 'nl': 'Dutch', 'pl': 'Polish',
    'ru': 'Russian', 'ukr': 'Ukrainian', 'bul': 'Bulgarian',
    'zh': 'Chinese', 'chi_sim': 'Chinese (Simplified)', 'chi_tra': 'Chinese (Traditional)',
    'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic',
    'hi': 'Hindi', 'bn': 'Bengali', 'ta': 'Tamil', 'te': 'Telugu',
    'mr': 'Marathi', 'ml': 'Malayalam', 'kn': 'Kannada', 'gu': 'Gujarati',
    'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'tr': 'Turkish',
    'el': 'Greek', 'he': 'Hebrew', 'cs': 'Czech', 'sv': 'Swedish',
    'da': 'Danish', 'fi': 'Finnish', 'hu': 'Hungarian', 'ro': 'Romanian',
}


def detect_script_from_text(text):
    """Detect script type from text"""
    for script, pattern in SCRIPT_PATTERNS.items():
        if re.search(pattern, text):
            return script
    return 'unknown'


def calculate_ngram_score(text, lang):
    """Calculate n-gram frequency score for a language"""
    lang_data = LANGUAGE_NGRAMS.get(lang)
    if not lang_data:
        return 0
    
    text_lower = text.lower()
    score = 0
    
    # Check trigrams
    for ngram in lang_data.get('trigrams', []):
        count = len(re.findall(ngram.lower(), text_lower))
        if count > 0:
            score += count
    
    # Check quadgrams (weighted more)
    for ngram in lang_data.get('quadgrams', []):
        count = len(re.findall(ngram.lower(), text_lower))
        if count > 0:
            score += count * 1.5
    
    return score


def calculate_char_score(text, lang):
    """Calculate character frequency match score"""
    lang_data = LANGUAGE_NGRAMS.get(lang)
    if not lang_data or not lang_data.get('common'):
        return 0
    
    text_lower = text.lower()
    lang_chars = lang_data['common'].lower()
    
    match_count = sum(1 for char in text_lower if char in lang_chars)
    total_chars = sum(1 for char in text_lower if char.isalpha())
    
    if total_chars == 0:
        return 0
    
    return (match_count / total_chars) * 100


def smart_detect_language_from_image(image_path, available_languages=None):
    """
    Multi-stage smart language detection for images.
    
    Args:
        image_path: Path to the image file
        available_languages: List of available Tesseract languages
    
    Returns:
        dict: Detection result with confidence scores
    """
    result = {
        'detected_script': 'unknown',
        'languages': [],
        'primary_language': None,
        'confidence': 0,
        'suggested_languages': [],
        'stages': [],
        'ocr_sample': None,
    }
    
    try:
        img = Image.open(image_path)
        
        # Stage 1: Tesseract OSD for script detection
        try:
            osd_data = pytesseract.image_to_osd(img)
            osd_lines = osd_data.split('\n')
            
            osd_script = None
            for line in osd_lines:
                if 'Script:' in line:
                    osd_script = line.split(':')[1].strip()
                    break
            
            if osd_script:
                result['detected_script'] = osd_script
                result['stages'].append({
                    'stage': 'osd_detection',
                    'script': osd_script,
                    'success': True,
                })
            else:
                result['stages'].append({
                    'stage': 'osd_detection',
                    'script': None,
                    'success': False,
                })
        except Exception as e:
            logger.warning(f"OSD detection failed: {e}")
            result['stages'].append({
                'stage': 'osd_detection',
                'error': str(e),
                'success': False,
            })
        
        # Stage 2: Quick OCR sample with script-based candidates
        candidate_langs = SCRIPT_TO_LANGUAGES.get(result['detected_script'], [])
        
        # If no OSD detection, try common languages
        if not candidate_langs:
            candidate_langs = ['eng', 'spa', 'fra', 'deu', 'ita', 'por']
        
        # Filter to available languages
        if available_languages:
            candidate_langs = [lang for lang in candidate_langs if lang in available_languages]
        
        # Get top 3 candidates for sample OCR
        sample_langs = candidate_langs[:3]
        
        if sample_langs:
            # Try OCR with each candidate language
            sample_results = []
            for lang in sample_langs:
                try:
                    sample_text = pytesseract.image_to_string(img, lang=lang)
                    text_length = len(sample_text.strip())
                    if text_length > 10:  # Only count if we got some text
                        # Calculate detection score from sample
                        ngram_score = calculate_ngram_score(sample_text, lang)
                        char_score = calculate_char_score(sample_text, lang)
                        total_score = (ngram_score * 0.6) + (char_score * 0.4)
                        
                        sample_results.append({
                            'lang': lang,
                            'text_length': text_length,
                            'ngram_score': ngram_score,
                            'char_score': char_score,
                            'total_score': total_score,
                            'sample': sample_text[:200],
                        })
                except Exception as e:
                    logger.warning(f"Sample OCR with {lang} failed: {e}")
            
            # Sort by score
            sample_results.sort(key=lambda x: x['total_score'], reverse=True)
            
            if sample_results:
                result['ocr_sample'] = sample_results[0]['sample']
                result['stages'].append({
                    'stage': 'sample_ocr',
                    'candidates': len(sample_results),
                    'best_lang': sample_results[0]['lang'],
                    'best_score': sample_results[0]['total_score'],
                    'success': True,
                })
        
        # Stage 3: Statistical analysis of best sample
        if result['ocr_sample'] and sample_results:
            text = result['ocr_sample']
            lang_scores = {}
            
            for sample in sample_results:
                lang = sample['lang']
                lang_scores[lang] = {
                    'ocr_text_length': sample['text_length'],
                    'ngram_score': sample['ngram_score'],
                    'char_score': sample['char_score'],
                    'total_score': sample['total_score'],
                }
            
            # Add n-gram analysis for all candidates
            for lang in candidate_langs:
                ngram = calculate_ngram_score(text, lang)
                char = calculate_char_score(text, lang)
                if lang in lang_scores:
                    lang_scores[lang]['ngram_analysis'] = ngram
                    lang_scores[lang]['char_analysis'] = char
                    # Weighted total
                    lang_scores[lang]['final_score'] = (
                        lang_scores[lang]['total_score'] * 0.5 +
                        ngram * 0.3 +
                        char * 0.2
                    )
                else:
                    lang_scores[lang] = {
                        'ngram_analysis': ngram,
                        'char_analysis': char,
                        'final_score': ngram * 0.5 + char * 0.5,
                    }
            
            # Sort by final score
            sorted_langs = sorted(
                lang_scores.items(),
                key=lambda x: x[1]['final_score'],
                reverse=True
            )
            
            # Build result languages
            result['languages'] = []
            for lang, scores in sorted_langs[:5]:
                confidence = min(scores['final_score'], 99.9)
                result['languages'].append({
                    'code': lang,
                    'name': LANGUAGE_NAMES.get(lang, lang.upper()),
                    'confidence': round(confidence, 1),
                    'breakdown': {
                        'ocr_confidence': round(scores.get('total_score', 0), 2),
                        'ngram_score': round(scores.get('ngram_analysis', 0), 2),
                        'char_score': round(scores.get('char_analysis', 0), 1),
                    },
                    'is_likely': confidence > 50,
                    'is_high_confidence': confidence > 80,
                })
            
            # Set primary language
            if result['languages']:
                result['primary_language'] = result['languages'][0]
                result['confidence'] = result['languages'][0]['confidence']
                result['suggested_languages'] = [
                    l['code'] for l in result['languages'][:3]
                ]
        
        # Generate suggestions
        if result['confidence'] > 80:
            result['suggestions'] = ['High confidence detection - OCR should work well']
        elif result['confidence'] > 50:
            result['suggestions'] = ['Medium confidence - consider verifying language']
        elif result['confidence'] > 30:
            result['suggestions'] = ['Low confidence - multiple languages detected, trying best match']
        else:
            result['suggestions'] = ['Very low confidence - consider manual language selection']
        
        # Check for CJK languages
        if result['detected_script'] in ['cjk', 'korean', 'japanese_hiragana', 'japanese_katakana']:
            result['suggestions'].append('CJK script detected - using script-specific OCR')
        
    except Exception as e:
        logger.error(f"Smart language detection failed: {e}")
        result['error'] = str(e)
        result['suggestions'] = ['Detection failed - falling back to default language']
    
    return result


def smart_ocr_image(image_path, available_languages=None, preferred_lang=None):
    """
    Smart OCR extraction with automatic language detection and fallback.
    
    Args:
        image_path: Path to the image file
        available_languages: List of available Tesseract languages
        preferred_lang: User's preferred language (if any)
    
    Returns:
        dict: OCR result with detection info
    """
    result = {
        'text': None,
        'language': None,
        'language_confidence': 0,
        'detection': None,
        'attempts': [],
        'success': False,
        'error': None,
    }
    
    try:
        img = Image.open(image_path)
        
        # Strategy 1: Use preferred language if provided
        if preferred_lang and preferred_lang in (available_languages or []):
            try:
                text = pytesseract.image_to_string(img, lang=preferred_lang)
                if len(text.strip()) > 20:  # Good result
                    result['text'] = text
                    result['language'] = preferred_lang
                    result['language_confidence'] = 100
                    result['success'] = True
                    result['attempts'].append({
                        'lang': preferred_lang,
                        'success': True,
                        'text_length': len(text),
                        'method': 'preferred_language',
                    })
                    return result
            except Exception as e:
                result['attempts'].append({
                    'lang': preferred_lang,
                    'success': False,
                    'error': str(e),
                    'method': 'preferred_language',
                })
        
        # Strategy 2: Smart detection
        detection = smart_detect_language_from_image(image_path, available_languages)
        result['detection'] = detection
        
        if detection['primary_language']:
            best_lang = detection['primary_language']['code']
            
            try:
                text = pytesseract.image_to_string(img, lang=best_lang)
                if len(text.strip()) > 20:
                    result['text'] = text
                    result['language'] = best_lang
                    result['language_confidence'] = detection['confidence']
                    result['success'] = True
                    result['attempts'].append({
                        'lang': best_lang,
                        'success': True,
                        'text_length': len(text),
                        'confidence': detection['confidence'],
                        'method': 'smart_detection',
                    })
                    return result
            except Exception as e:
                result['attempts'].append({
                    'lang': best_lang,
                    'success': False,
                    'error': str(e),
                    'method': 'smart_detection',
                })
        
        # Strategy 3: Try English as fallback
        if 'eng' in (available_languages or []):
            try:
                text = pytesseract.image_to_string(img, lang='eng')
                result['text'] = text
                result['language'] = 'eng'
                result['language_confidence'] = 0
                result['success'] = True
                result['attempts'].append({
                    'lang': 'eng',
                    'success': True,
                    'text_length': len(text),
                    'method': 'english_fallback',
                })
                result['suggestions'] = ['Used English fallback - consider verifying detected language']
                return result
            except Exception as e:
                result['attempts'].append({
                    'lang': 'eng',
                    'success': False,
                    'error': str(e),
                    'method': 'english_fallback',
                })
        
        # Strategy 4: Try all available languages
        if available_languages:
            for lang in available_languages:
                if lang == 'eng':  # Already tried
                    continue
                try:
                    text = pytesseract.image_to_string(img, lang=lang)
                    if len(text.strip()) > len(result.get('text', '').strip()):
                        result['text'] = text
                        result['language'] = lang
                        result['success'] = True
                        result['attempts'].append({
                            'lang': lang,
                            'success': True,
                            'text_length': len(text),
                            'method': 'fallback_scan',
                        })
                except Exception as e:
                    pass
        
        if result['text']:
            result['suggestions'] = ['Used fallback language - detection may not be optimal']
        else:
            result['error'] = 'Could not extract text with any available language'
            result['suggestions'] = ['Install additional Tesseract language packs']
            
    except Exception as e:
        logger.error(f"Smart OCR failed: {e}")
        result['error'] = str(e)
    
    return result


def get_confidence_level(confidence):
    """Get confidence level label"""
    if confidence >= 80:
        return 'high'
    elif confidence >= 50:
        return 'medium'
    elif confidence >= 30:
        return 'low'
    else:
        return 'very_low'


def format_detection_result(detection):
    """Format detection result for API response"""
    if not detection:
        return None
    
    return {
        'detected_script': detection.get('detected_script', 'unknown'),
        'primary_language': detection.get('primary_language'),
        'confidence': detection.get('confidence', 0),
        'confidence_level': get_confidence_level(detection.get('confidence', 0)),
        'languages': detection.get('languages', []),
        'suggested_languages': detection.get('suggested_languages', []),
        'suggestions': detection.get('suggestions', []),
        'stages': detection.get('stages', []),
    }


if __name__ == '__main__':
    # Test the module
    import sys
    if len(sys.argv) > 1:
        result = smart_detect_language_from_image(sys.argv[1])
        print(f"Detection Result: {result}")

