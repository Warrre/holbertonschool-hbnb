#!/usr/bin/env python3
"""
HBnB Backend Startup Script
Simple starter script that handles common setup issues
"""

import os
import sys
import subprocess

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7+ is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def install_requirements():
    """Install required packages"""
    requirements = [
        'flask',
        'flask-restx', 
        'flask-bcrypt',
        'flask-jwt-extended',
        'flask-sqlalchemy',
        'flask-cors'
    ]
    
    print("📦 Installing required packages...")
    for package in requirements:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ {package} installed")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")
            try:
                # Try with user flag
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--user', package])
                print(f"✅ {package} installed (user)")
            except subprocess.CalledProcessError:
                print(f"❌ Could not install {package} - you may need to install it manually")

def setup_environment():
    """Set up environment variables"""
    os.environ.setdefault('FLASK_APP', 'run.py')
    os.environ.setdefault('FLASK_ENV', 'development')
    os.environ.setdefault('FLASK_DEBUG', '1')
    print("✅ Environment variables set")

def run_backend():
    """Start the Flask backend"""
    try:
        print("🚀 Starting HBnB Backend...")
        print("Backend will be available at: http://localhost:5000")
        print("Press Ctrl+C to stop")
        
        # Import and run the app
        from app import create_app, db
        app = create_app()
        
        with app.app_context():
            db.create_all()
            print("✅ Database tables created")
        
        app.run(host='0.0.0.0', port=5000, debug=True)
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're in the Backend directory and all dependencies are installed")
        return False
    except Exception as e:
        print(f"❌ Startup error: {e}")
        return False

def main():
    """Main startup function"""
    print("=" * 60)
    print("🏠 HBnB Backend Startup")
    print("=" * 60)
    
    if not check_python_version():
        return
    
    # Change to Backend directory if needed
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if not os.path.exists('app') and 'Backend' in os.listdir('.'):
        os.chdir('Backend')
        print("📁 Switched to Backend directory")
    elif not os.path.exists('app'):
        print("❌ Cannot find Backend directory or app module")
        print("Make sure you're running this from the correct location")
        return
    
    install_requirements()
    setup_environment()
    
    try:
        run_backend()
    except KeyboardInterrupt:
        print("\n🛑 Backend stopped by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
