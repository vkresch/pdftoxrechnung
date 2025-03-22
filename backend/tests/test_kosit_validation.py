import os
import pytest
from pathlib import Path
from backend.validate import validate

xml_files = [
    "./backend/tests/samples/xrechnungen/zugferd1_invoice_pdfa3b.xml",
    "./backend/tests/samples/xrechnungen/ubl-br-cl-14-15-and-br-co-09-country-codes-kosovo.xml",
]


@pytest.mark.parametrize("xml_file", xml_files)
def test_kosit_validation(xml_file):
    UPLOAD_FOLDER = Path("./uploads")
    assert validate(xml_file, UPLOAD_FOLDER) == {
        "return_code": 0,
        "message": "Validation completed",
        "description": "XRechnung is valid according to KoSIT Validator 1.5.0.",
    }
    xml_file_only = xml_file.split("/")[-1]
    assert os.path.isfile(
        UPLOAD_FOLDER / f"{xml_file_only.replace('.xml', '-report.xml')}"
    )
    assert os.path.isfile(
        UPLOAD_FOLDER / f"{xml_file_only.replace('.xml', '-report.html')}"
    )
