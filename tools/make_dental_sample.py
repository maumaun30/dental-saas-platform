import json
import os
import numpy as np
from pydicom.dataset import FileDataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, generate_uid, SecondaryCaptureImageStorage
from PIL import Image, ImageOps

HERE = os.path.dirname(__file__)
SRC_DIR = os.path.join(HERE, "source-images")
OUT_DIR = os.path.abspath(
    os.path.join(HERE, "..", "Viewers", "platform", "app", "public", "dental-samples")
)
os.makedirs(OUT_DIR, exist_ok=True)

ROOT = "1.2.826.0.1.3680043.10.1338"
CURRENT_STUDY_UID = f"{ROOT}.1.20260617"
PRIOR_STUDY_UID = f"{ROOT}.2.20251112"
PATIENT_ID = "DEN-000142"
PATIENT_NAME = "John Doe"

MAX_SIDE = 1800


def load_gray(name):
    im = Image.open(os.path.join(SRC_DIR, name))
    im = ImageOps.exif_transpose(im).convert("L")
    if max(im.size) > MAX_SIDE:
        scale = MAX_SIDE / max(im.size)
        im = im.resize((round(im.width * scale), round(im.height * scale)))
    return np.asarray(im, dtype=np.uint8)


def write_instance(fname, pixels, pixel_spacing, study_uid, study_date, study_desc,
                   series_desc, modality, series_num):
    rows, cols = pixels.shape
    series_uid = generate_uid()
    sop_uid = generate_uid()

    meta = FileMetaDataset()
    meta.MediaStorageSOPClassUID = SecondaryCaptureImageStorage
    meta.MediaStorageSOPInstanceUID = sop_uid
    meta.TransferSyntaxUID = ExplicitVRLittleEndian
    meta.ImplementationClassUID = generate_uid()

    ds = FileDataset(None, {}, file_meta=meta, preamble=b"\0" * 128)
    ds.PatientName = PATIENT_NAME
    ds.PatientID = PATIENT_ID
    ds.PatientBirthDate = "19890214"
    ds.PatientSex = "M"
    ds.StudyInstanceUID = study_uid
    ds.SeriesInstanceUID = series_uid
    ds.SOPInstanceUID = sop_uid
    ds.SOPClassUID = SecondaryCaptureImageStorage
    ds.StudyDescription = study_desc
    ds.SeriesDescription = series_desc
    ds.Modality = modality
    ds.StudyDate = study_date
    ds.StudyTime = "093000"
    ds.SeriesDate = study_date
    ds.SeriesTime = "093000"
    ds.AccessionNumber = "DENT-" + study_date
    ds.StudyID = "1"
    ds.SeriesNumber = series_num
    ds.InstanceNumber = 1

    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.Rows = rows
    ds.Columns = cols
    ds.BitsAllocated = 8
    ds.BitsStored = 8
    ds.HighBit = 7
    ds.PixelRepresentation = 0
    ds.PixelSpacing = [str(pixel_spacing[0]), str(pixel_spacing[1])]
    ds.ImagerPixelSpacing = ds.PixelSpacing
    ds.WindowCenter = "128"
    ds.WindowWidth = "256"
    ds.RescaleIntercept = "0"
    ds.RescaleSlope = "1"
    ds.PixelData = pixels.tobytes()
    ds.save_as(os.path.join(OUT_DIR, fname), enforce_file_format=True)

    naturalized = {
        "SOPInstanceUID": sop_uid,
        "SOPClassUID": str(SecondaryCaptureImageStorage),
        "SeriesInstanceUID": series_uid,
        "StudyInstanceUID": study_uid,
        "PatientName": PATIENT_NAME,
        "PatientID": PATIENT_ID,
        "PatientBirthDate": "19890214",
        "PatientSex": "M",
        "StudyDate": study_date,
        "StudyDescription": study_desc,
        "Modality": modality,
        "SeriesNumber": series_num,
        "SeriesDescription": series_desc,
        "InstanceNumber": 1,
        "Rows": rows,
        "Columns": cols,
        "SamplesPerPixel": 1,
        "PhotometricInterpretation": "MONOCHROME2",
        "BitsAllocated": 8,
        "BitsStored": 8,
        "HighBit": 7,
        "PixelRepresentation": 0,
        "PixelSpacing": list(pixel_spacing),
        "ImagerPixelSpacing": list(pixel_spacing),
        "WindowCenter": 128,
        "WindowWidth": 256,
        "RescaleIntercept": 0,
        "RescaleSlope": 1,
    }
    series_block = {
        "SeriesInstanceUID": series_uid,
        "SeriesNumber": series_num,
        "SeriesDescription": series_desc,
        "Modality": modality,
        "instances": [
            {"metadata": naturalized, "url": f"dicomweb:/dental-samples/{fname}"}
        ],
    }
    return series_block


def build_study(study_uid, study_date, study_desc, series_specs):
    series = []
    modalities = []
    for spec in series_specs:
        block = write_instance(
            fname=spec["fname"],
            pixels=load_gray(spec["src"]),
            pixel_spacing=spec["spacing"],
            study_uid=study_uid,
            study_date=study_date,
            study_desc=study_desc,
            series_desc=spec["desc"],
            modality=spec["modality"],
            series_num=spec["series_num"],
        )
        series.append(block)
        modalities.append(spec["modality"])
    return {
        "StudyInstanceUID": study_uid,
        "StudyDescription": study_desc,
        "StudyDate": study_date,
        "StudyTime": "093000",
        "PatientName": PATIENT_NAME,
        "PatientID": PATIENT_ID,
        "AccessionNumber": "DENT-" + study_date,
        "Modalities": ",".join(sorted(set(modalities))),
        "NumInstances": len(series),
        "series": series,
    }


current_study = build_study(
    CURRENT_STUDY_UID, "20260617", "Dental Panoramic + Bitewings",
    [
        {"fname": "panoramic.dcm", "src": "after.jpg", "desc": "Panoramic", "modality": "PX",
         "series_num": 1, "spacing": [0.143, 0.143]},
        {"fname": "bitewing-left.dcm", "src": "left.jpg", "desc": "Bitewing Left", "modality": "IO",
         "series_num": 2, "spacing": [0.085, 0.085]},
        {"fname": "bitewing-right.dcm", "src": "right.jpg", "desc": "Bitewing Right", "modality": "IO",
         "series_num": 3, "spacing": [0.085, 0.085]},
    ],
)
prior_study = build_study(
    PRIOR_STUDY_UID, "20251112", "Prior Panoramic",
    [
        {"fname": "panoramic-prior.dcm", "src": "before.jpg", "desc": "Panoramic (prior)",
         "modality": "PX", "series_num": 1, "spacing": [0.143, 0.143]},
    ],
)

manifest = {"studies": [current_study, prior_study]}

with open(os.path.join(OUT_DIR, "dental-study.json"), "w") as f:
    json.dump(manifest, f, indent=2)

print("Wrote to", OUT_DIR)
for f in sorted(os.listdir(OUT_DIR)):
    print("  ", f, os.path.getsize(os.path.join(OUT_DIR, f)), "bytes")
print("Current study:", CURRENT_STUDY_UID)
print("Prior study  :", PRIOR_STUDY_UID)
