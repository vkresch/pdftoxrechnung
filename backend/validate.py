import logging
import subprocess
from pathlib import Path

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)


def validate(xml_file, upload_folder=Path("./uploads")):
    jar_path = "validator/validationtool-1.5.0-standalone.jar"
    scenarios_file = "validator/scenarios.xml"
    output_directory = Path.cwd() / "validator/"

    command = [
        "java",
        "-jar",
        jar_path,
        "-s",
        scenarios_file,
        "-r",
        str(output_directory),
        "--output-directory",
        str(upload_folder),
        "-h",
        xml_file,
    ]

    try:
        logging.info(f"Validating {xml_file} ...")
        result = subprocess.run(command, capture_output=True, text=True)
        return_code = result.returncode

        response = {"return_code": return_code, "message": "Validation completed"}

        if return_code == 0:
            response["description"] = (
                "XRechnung is valid according to KoSIT Validator 1.5.0."
            )
        elif return_code > 0:
            response["description"] = (
                "XRechnung file is invalid according to KoSIT Validator 1.5.0."
            )
        elif return_code == -1:
            response["description"] = "Parsing error: Incorrect command-line arguments."
        elif return_code == -2:
            response["description"] = (
                "Configuration error: Issues with loading configuration/validation targets."
            )
        else:
            response["description"] = "Unknown error."

        logging.info(f"Validation completed: {response['description']}")
        return response
    except Exception as e:
        return {"return_code": -99, "description": str(e)}
