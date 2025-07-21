import sys
import os

# Add the Backend directory to the Python path to ensure correct import
# This assumes check_support.py and support.py are both directly in the 'Backend' folder.
backend_dir = r'C:\Users\sleig\GridX1\GridX\for-the-100th-time\Backend'
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

print(f"Python path being used: {sys.path}")

try:
    import support
    print(f"\nSuccessfully imported support module from: {support.__file__}")

    if hasattr(support, 'update_user_by_id'):
        print("✅ Function 'update_user_by_id' found in support module.")
        # You can uncomment the line below to see its documentation
        # print(f"Docstring for update_user_by_id: {support.update_user_by_id.__doc__}")
    else:
        print("❌ Function 'update_user_by_id' NOT found in support module.")
        print("\nAvailable attributes in support module:")
        for attr in dir(support):
            if not attr.startswith('__'): # Exclude built-in attributes
                print(f"- {attr}")

except ImportError as e:
    print(f"\n🚨 Failed to import support module: {e}")
    print("This means Python cannot find the 'support.py' file or there's a critical error during its initial load.")
except Exception as e:
    print(f"\nAn unexpected error occurred: {e}") 