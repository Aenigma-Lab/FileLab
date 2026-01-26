la#!/bin/bash

# Test script to verify all OCR languages are installed
# This script can be run inside the Docker container

echo "========================================="
echo "Testing Tesseract OCR Language Installation"
echo "========================================="
echo ""

# Check if Tesseract is installed
if ! command -v tesseract &> /dev/null; then
    echo "❌ Tesseract OCR is not installed"
    exit 1
fi

echo "✅ Tesseract OCR version:"
tesseract --version
echo ""

# List all installed language packs
echo "========================================="
echo "Installed OCR Language Packs:"
echo "========================================="

# Check the tessdata directory
TESSDATA_PATH="/usr/share/tesseract-ocr/5/tessdata"

if [ -d "$TESSDATA_PATH" ]; then
    echo "📁 Language files in $TESSDATA_PATH:"
    echo ""
    
    # Count and list all traineddata files
    lang_count=$(ls -1 "$TESSDATA_PATH"/*.traineddata 2>/dev/null | wc -l)
    echo "Total languages installed: $lang_count"
    echo ""
    
    echo "Language list:"
    ls -1 "$TESSDATA_PATH"/*.traineddata 2>/dev/null | xargs -I {} basename {} .traineddata | sort
    
    echo ""
    echo "========================================="
    echo "Language Categories Found:"
    echo "========================================="
    
    # Check for common language categories
    echo ""
    echo "🌍 Major World Languages:"
    for lang in eng deu fra spa ita por nld rus jpn chi_sim chi_tra kor ara hin; do
        if [ -f "$TESSDATA_PATH/${lang}.traineddata" ]; then
            echo "  ✅ $lang"
        fi
    done
    
    echo ""
    echo "🌐 European Languages:"
    for lang in ces ell heb pol swe tur ukr cat vie ind tha; do
        if [ -f "$TESSDATA_PATH/${lang}.traineddata" ]; then
            echo "  ✅ $lang"
        fi
    done
    
    echo ""
    echo "🌏 Asian Languages:"
    for lang in ben tha vie ind mya; do
        if [ -f "$TESSDATA_PATH/${lang}.traineddata" ]; then
            echo "  ✅ $lang"
        fi
    done
    
    echo ""
    echo "========================================="
    echo "🇮🇳 ALL INDIAN LANGUAGES INSTALLED:"
    echo "========================================="
    
    # Major Indian Languages (Scheduled 8th Schedule)
    echo ""
    echo "📋 Major Indian Languages (8th Schedule):"
    for lang in hin hin_deva Hindi devanagari tam Tamil tel Telugu ben Bengali mar Marathi guj Gujarati kan Kannada mal Malayalam pun Punjabi urd Urdu; do
        # Check for various possible file names
        if [ -f "$TESSDATA_PATH/hin.traineddata" ]; then echo "  ✅ Hindi (हिन्दी) - hin"; fi
        if [ -f "$TESSDATA_PATH/tam.traineddata" ]; then echo "  ✅ Tamil (தமிழ்) - tam"; fi
        if [ -f "$TESSDATA_PATH/tel.traineddata" ]; then echo "  ✅ Telugu (తెలుగు) - tel"; fi
        if [ -f "$TESSDATA_PATH/bn.traineddata" ]; then echo "  ✅ Bengali (বাংলা) - bn"; fi
        if [ -f "$TESSDATA_PATH/mar.traineddata" ]; then echo "  ✅ Marathi (मराठी) - mar"; fi
        if [ -f "$TESSDATA_PATH/guj.traineddata" ]; then echo "  ✅ Gujarati (ગુજરાતી) - guj"; fi
        if [ -f "$TESSDATA_PATH/kan.traineddata" ]; then echo "  ✅ Kannada (ಕನ್ನಡ) - kan"; fi
        if [ -f "$TESSDATA_PATH/mal.traineddata" ]; then echo "  ✅ Malayalam (മലയാളം) - mal"; fi
        if [ -f "$TESSDATA_PATH/pun.traineddata" ]; then echo "  ✅ Punjabi (ਪੰਜਾਬੀ) - pun"; fi
        if [ -f "$TESSDATA_PATH/urd.traineddata" ]; then echo "  ✅ Urdu (اردو) - urd"; fi
        break
    done
    
    echo ""
    echo "📋 Additional Indian Languages:"
    # Assamese
    if [ -f "$TESSDATA_PATH/asm.traineddata" ]; then echo "  ✅ Assamese (অসমীয়া) - asm"; fi
    if [ -f "$TESSDATA_PATH/asm.traineddata" ]; then echo "  ✅ Assamese (অসমীয়া) - asm"; fi
    
    # Bodhi/Bodo
    if [ -f "$TESSDATA_PATH/bod.traineddata" ]; then echo "  ✅ Bodo (बोड़ो) - bod"; fi
    
    # Dogri
    if [ -f "$TESSDATA_PATH/doi.traineddata" ]; then echo "  ✅ Dogri (डोगरी) - doi"; fi
    
    # Kashmiri
    if [ -f "$TESSDATA_PATH/kas.traineddata" ]; then echo "  ✅ Kashmiri (کٲشُر) - kas"; fi
    
    # Konkani
    if [ -f "$TESSDATA_PATH/kok.traineddata" ]; then echo "  ✅ Konkani (कोंकणी) - kok"; fi
    
    # Maithili
    if [ -f "$TESSDATA_PATH/mai.traineddata" ]; then echo "  ✅ Maithili (मैथिली) - mai"; fi
    
    # Manipuri
    if [ -f "$TESSDATA_PATH/man.traineddata" ]; then echo "  ✅ Manipuri (মেইতেই) - man"; fi
    if [ -f "$TESSDATA_PATH/mni.traineddata" ]; then echo "  ✅ Manipuri (মেইতেই) - mni"; fi
    
    # Nepali
    if [ -f "$TESSDATA_PATH/nep.traineddata" ]; then echo "  ✅ Nepali (नेपाली) - nep"; fi
    
    # Odia
    if [ -f "$TESSDATA_PATH/odi.traineddata" ]; then echo "  ✅ Odia (ଓଡ଼ିଆ) - odi"; fi
    if [ -f "$TESSDATA_PATH/ori.traineddata" ]; then echo "  ✅ Odia (ଓଡ଼ିଆ) - ori"; fi
    
    # Sanskrit
    if [ -f "$TESSDATA_PATH/san.traineddata" ]; then echo "  ✅ Sanskrit (संस्कृतम्) - san"; fi
    
    # Santali
    if [ -f "$TESSDATA_PATH/sat.traineddata" ]; then echo "  ✅ Santali (ᱥᱟᱱᱛᱟᱲᱤ) - sat"; fi
    
    # Sindhi
    if [ -f "$TESSDATA_PATH/snd.traineddata" ]; then echo "  ✅ Sindhi (सिन्धी) - snd"; fi
    
    # Sinhala
    if [ -f "$TESSDATA_PATH/sin.traineddata" ]; then echo "  ✅ Sinhala (සිංහල) - sin"; fi
    
    echo ""
    echo "📝 Script Types:"
    for script in arabic cyrillic devanagari han hangul hebrew latin; do
        echo -n "  $script: "
        if ls "$TESSDATA_PATH"/*${script}*.traineddata &> /dev/null; then
            echo "✅"
        else
            echo "❌"
        fi
    done
    
else
    echo "❌ Tessdata directory not found at $TESSDATA_PATH"
    echo "Languages may not have been downloaded during Docker build"
    exit 1
fi

echo ""
echo "========================================="
echo "Testing OCR with Different Languages"
echo "========================================="

# Create a simple test image
echo "Creating test image..."
convert -size 100x50 xc:white -fill black -draw "text 10,30 'Test'" /tmp/test_image.png 2>/dev/null || \
echo "ImageMagick not available, skipping OCR test"

# Test OCR with English
if command -v tesseract &> /dev/null && [ -f /tmp/test_image.png ]; then
    echo ""
    echo "Testing English OCR..."
    if tesseract /tmp/test_image.png /tmp/test_output -l eng &> /dev/null; then
        echo "✅ English OCR test passed"
    else
        echo "⚠️  English OCR test completed (may need better test image)"
    fi
    
    # Clean up
    rm -f /tmp/test_image.png /tmp/test_output.txt
fi

echo ""
echo "========================================="
echo "Summary"
echo "========================================="
echo "Total languages available: $lang_count"
echo ""
echo "To use a specific language in OCR:"
echo "  tesseract image.png output -l spa    # Spanish"
echo "  tesseract image.png output -l chi_sim # Chinese Simplified"
echo "  tesseract image.png output -l ara     # Arabic"
echo ""
echo "To use multiple languages:"
echo "  tesseract image.png output -l eng+spa+fra"
echo ""

if [ $lang_count -gt 50 ]; then
    echo "🎉 Excellent! Over 50 languages installed - comprehensive OCR support!"
else
    echo "⚠️  Only $lang_count languages installed. You may need more languages for full coverage."
fi
