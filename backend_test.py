import requests
import sys
import os
import tempfile
from datetime import datetime
from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import zipfile
import io

class FileConversionTester:
    def __init__(self, base_url="https://filemagic-tools-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.temp_dir = Path(tempfile.mkdtemp())
        print(f"Using temp directory: {self.temp_dir}")

    def create_test_files(self):
        """Create test files for conversion testing"""
        print("Creating test files...")
        
        # Create a simple text file
        self.txt_file = self.temp_dir / "test.txt"
        self.txt_file.write_text("This is a test document.\nLine 2 of the test.\nLine 3 for testing.")
        
        # Create a simple image
        self.jpg_file = self.temp_dir / "test.jpg"
        img = Image.new('RGB', (200, 100), color='white')
        img.save(self.jpg_file, 'JPEG')
        
        # Create a simple PDF
        self.pdf_file = self.temp_dir / "test.pdf"
        c = canvas.Canvas(str(self.pdf_file), pagesize=letter)
        c.drawString(100, 750, "Test PDF Document")
        c.drawString(100, 730, "Page 1 content")
        c.showPage()
        c.drawString(100, 750, "Page 2 content")
        c.save()
        
        # Create a second PDF for merging
        self.pdf_file2 = self.temp_dir / "test2.pdf"
        c2 = canvas.Canvas(str(self.pdf_file2), pagesize=letter)
        c2.drawString(100, 750, "Second PDF Document")
        c2.save()
        
        # Create a ZIP file
        self.zip_file = self.temp_dir / "test.zip"
        with zipfile.ZipFile(self.zip_file, 'w') as zf:
            zf.writestr("file1.txt", "Content of file 1")
            zf.writestr("file2.txt", "Content of file 2")
        
        print("Test files created successfully")

    def run_test(self, name, method, endpoint, expected_status, files=None, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, headers=headers, timeout=60)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    try:
                        print(f"Response: {response.json()}")
                    except:
                        pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:500]}")

            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_document_conversion(self):
        """Test document conversion endpoints"""
        results = []
        
        # Test TXT to PDF conversion
        with open(self.txt_file, 'rb') as f:
            files = {'file': ('test.txt', f, 'text/plain')}
            data = {'target_format': 'pdf'}
            success, response = self.run_test(
                "TXT to PDF Conversion", "POST", "convert/document", 200, files, data
            )
            results.append(success)
        
        return all(results)

    def test_image_conversion(self):
        """Test image conversion endpoints"""
        with open(self.jpg_file, 'rb') as f:
            files = {'file': ('test.jpg', f, 'image/jpeg')}
            data = {'target_format': 'png'}
            success, response = self.run_test(
                "JPG to PNG Conversion", "POST", "convert/image", 200, files, data
            )
            return success

    def test_pdf_lock(self):
        """Test PDF locking"""
        with open(self.pdf_file, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {'password': 'testpass123'}
            success, response = self.run_test(
                "PDF Lock", "POST", "pdf/lock", 200, files, data
            )
            return success

    def test_pdf_unlock(self):
        """Test PDF unlocking - first lock a PDF, then unlock it"""
        # First create a locked PDF
        with open(self.pdf_file, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {'password': 'testpass123'}
            lock_success, lock_response = self.run_test(
                "PDF Lock (for unlock test)", "POST", "pdf/lock", 200, files, data
            )
        
        if not lock_success:
            return False
            
        # Save the locked PDF
        locked_pdf_path = self.temp_dir / "locked.pdf"
        with open(locked_pdf_path, 'wb') as f:
            f.write(lock_response.content)
        
        # Now test unlocking
        with open(locked_pdf_path, 'rb') as f:
            files = {'file': ('locked.pdf', f, 'application/pdf')}
            data = {'password': 'testpass123'}
            success, response = self.run_test(
                "PDF Unlock", "POST", "pdf/unlock", 200, files, data
            )
            return success

    def test_pdf_merge(self):
        """Test PDF merging"""
        with open(self.pdf_file, 'rb') as f1, open(self.pdf_file2, 'rb') as f2:
            files = [
                ('files', ('test1.pdf', f1, 'application/pdf')),
                ('files', ('test2.pdf', f2, 'application/pdf'))
            ]
            success, response = self.run_test(
                "PDF Merge", "POST", "pdf/merge", 200, files, None
            )
            return success

    def test_pdf_split(self):
        """Test PDF splitting"""
        with open(self.pdf_file, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {'page_ranges': '1,2'}
            success, response = self.run_test(
                "PDF Split", "POST", "pdf/split", 200, files, data
            )
            return success

    def test_zip_compress(self):
        """Test ZIP compression"""
        with open(self.txt_file, 'rb') as f1, open(self.jpg_file, 'rb') as f2:
            files = [
                ('files', ('test.txt', f1, 'text/plain')),
                ('files', ('test.jpg', f2, 'image/jpeg'))
            ]
            success, response = self.run_test(
                "ZIP Compress", "POST", "zip/compress", 200, files, None
            )
            return success

    def test_zip_extract(self):
        """Test ZIP extraction"""
        with open(self.zip_file, 'rb') as f:
            files = {'file': ('test.zip', f, 'application/zip')}
            success, response = self.run_test(
                "ZIP Extract", "POST", "zip/extract", 200, files, None
            )
            return success

    def test_ocr_extract(self):
        """Test OCR text extraction"""
        # Create an image with text for OCR
        ocr_img = Image.new('RGB', (400, 100), color='white')
        # Note: This is a simple image, OCR might not extract much text
        ocr_path = self.temp_dir / "ocr_test.png"
        ocr_img.save(ocr_path, 'PNG')
        
        with open(ocr_path, 'rb') as f:
            files = {'file': ('ocr_test.png', f, 'image/png')}
            success, response = self.run_test(
                "OCR Extract", "POST", "ocr/extract", 200, files, None
            )
            return success

    def test_history(self):
        """Test conversion history"""
        success, response = self.run_test("Conversion History", "GET", "history", 200)
        return success

    def cleanup(self):
        """Clean up temporary files"""
        import shutil
        try:
            shutil.rmtree(self.temp_dir)
            print(f"Cleaned up temp directory: {self.temp_dir}")
        except Exception as e:
            print(f"Warning: Could not clean up temp directory: {e}")

def main():
    print("🚀 Starting File Conversion API Tests")
    print("=" * 50)
    
    tester = FileConversionTester()
    
    try:
        # Create test files
        tester.create_test_files()
        
        # Run all tests
        test_results = []
        
        test_results.append(tester.test_root_endpoint())
        test_results.append(tester.test_document_conversion())
        test_results.append(tester.test_image_conversion())
        test_results.append(tester.test_pdf_lock())
        test_results.append(tester.test_pdf_unlock())
        test_results.append(tester.test_pdf_merge())
        test_results.append(tester.test_pdf_split())
        test_results.append(tester.test_zip_compress())
        test_results.append(tester.test_zip_extract())
        test_results.append(tester.test_ocr_extract())
        test_results.append(tester.test_history())
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
        
        if tester.tests_passed == tester.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed")
            return 1
            
    except Exception as e:
        print(f"💥 Test suite failed with error: {str(e)}")
        return 1
    finally:
        tester.cleanup()

if __name__ == "__main__":
    sys.exit(main())