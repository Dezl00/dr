import sys
import re

file_path = r'c:\xampp\htdocs\drs\admin_mobile_app\lib\features\appointments\providers\appointment_provider.dart'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"patientPhone: data\['patientPhone'\]\?\.toString\(\) \?\? '([^']*)',",
    r"patientPhone: data['patientPhone']?.toString() ?? '\g<1>',\n        doctorId: data['doctorId']?.toString() ?? '',\n        doctorName: data['doctorName']?.toString() ?? '',",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
