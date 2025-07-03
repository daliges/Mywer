import pytest
import sys


def main():
    # List of unit test files in each microservice
    test_files = [
        "api_gateway/tests/test_unit.py",
        "matching_recommendation/tests/test_unit.py",
        "download/tests/test_unit.py",
        "spotify/tests/test_unit.py",
    ]
    # Run pytest on each file
    exit_code = 0
    for test_file in test_files:
        print(f"\n=== Running unit tests: {test_file} ===")
        code = pytest.main([test_file])
        if code != 0:
            exit_code = code
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
