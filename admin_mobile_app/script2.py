import sys
import re

file_path = r'c:\xampp\htdocs\drs\admin_mobile_app\lib\features\appointments\screens\create_appointment_screen.dart'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace ref.read(appointmentRepositoryProvider).createAppointment(data);
content = content.replace(
    'await ref.read(appointmentRepositoryProvider).createAppointment(data);',
    'final success = await ref.read(appointmentStateProvider.notifier).createAppointment(data);\n      if (!success) throw Exception("Failed to create appointment");'
)

# Replace ref.refresh(appointmentsFutureProvider);
content = content.replace(
    'ref.refresh(appointmentsFutureProvider);',
    '// ref.refresh no longer needed'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
