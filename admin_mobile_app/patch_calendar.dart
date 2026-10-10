import 'dart:io';

void main() {
  final file = File('lib/features/appointments/screens/calendar_screen.dart');
  var content = file.readAsStringSync();

  // 1. Add ScrollController to state
  if (!content.contains('ScrollController _daysScrollController')) {
    content = content.replaceFirst(
      'StreamSubscription? _notificationSub;',
      'StreamSubscription? _notificationSub;\n  late ScrollController _daysScrollController;'
    );
  }

  // 2. Initialize ScrollController
  if (!content.contains('_daysScrollController = ScrollController')) {
    content = content.replaceFirst(
      'super.initState();',
      'super.initState();\n    // Assume each day item is about 64px wide. Initial scroll offset to show current day.\n    final today = DateTime.now();\n    _daysScrollController = ScrollController(initialScrollOffset: (today.day > 3 ? today.day - 3 : 0) * 68.0);'
    );
  }

  if (!content.contains('_daysScrollController.dispose()')) {
    content = content.replaceFirst(
      'super.dispose();',
      '_daysScrollController.dispose();\n    super.dispose();'
    );
  }

  // 3. Replace _buildDateSelector
  final RegExp buildDateSelectorPattern = RegExp(r'Widget _buildDateSelector\(DateTime selectedDate\)\s*{[\s\S]*?Widget _buildStatusTabs', multiLine: true);
  
  final newDateSelector = '''Widget _buildDateSelector(DateTime selectedDate) {
    final today = DateTime.now();
    final todayStart = DateTime(today.year, today.month, today.day);
    
    // Generate days for the selected month
    final daysInMonth = DateUtils.getDaysInMonth(selectedDate.year, selectedDate.month);
    final List<DateTime> dates = [];
    for (int i = 1; i <= daysInMonth; i++) {
      dates.add(DateTime(selectedDate.year, selectedDate.month, i));
    }

    final monthYear = _toEnglishNumbers(DateFormat('MMMM yyyy', 'ar').format(selectedDate));
    final dayFull = _toEnglishNumbers(DateFormat('EEEE - d MMMM', 'ar').format(selectedDate));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_right, color: Color(0xFF2563EB)),
                onPressed: () {
                  final newDate = DateTime(selectedDate.year, selectedDate.month + 1, 1);
                  ref.read(selectedDateProvider.notifier).state = newDate;
                  _daysScrollController.jumpTo(0);
                },
              ),
              Text(
                monthYear,
                style: const TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  color: Color(0xFF0F172A),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_left, color: Color(0xFF2563EB)),
                onPressed: () {
                  final newDate = DateTime(selectedDate.year, selectedDate.month - 1, 1);
                  ref.read(selectedDateProvider.notifier).state = newDate;
                  _daysScrollController.jumpTo(0);
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 80,
          child: ListView.builder(
            controller: _daysScrollController,
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: dates.length,
            itemBuilder: (context, index) {
              final date = dates[index];
              final dateStart = DateTime(date.year, date.month, date.day);
              final isSelected = dateStart == DateTime(selectedDate.year, selectedDate.month, selectedDate.day);
              final isPast = dateStart.isBefore(todayStart);

              final dayName = DateFormat('E', 'ar').format(date);
              final dayNum = date.day.toString(); // already English numeral

              Color bgColor = Colors.transparent;
              Color dayNameColor = const Color(0xFF94A3B8);
              Color dayNumColor = const Color(0xFF0F172A);

              if (isSelected) {
                bgColor = const Color(0xFF2563EB);
                dayNameColor = Colors.white;
                dayNumColor = Colors.white;
              } else if (isPast) {
                dayNumColor = const Color(0xFF94A3B8);
              }

              return GestureDetector(
                onTap: () {
                  ref.read(selectedDateProvider.notifier).state = date;
                },
                child: Container(
                  width: 60,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        dayName,
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: dayNameColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        dayNum,
                        style: TextStyle(
                          fontFamily: 'IBMPlexSansArabic',
                          color: dayNumColor,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (isSelected) ...[
                        const SizedBox(height: 4),
                        Container(
                          width: 4,
                          height: 4,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: Row(
            children: [
              Text(
                dayFull,
                style: const TextStyle(
                  fontFamily: 'IBMPlexSansArabic',
                  color: Color(0xFF475569),
                  fontSize: 14,
                ),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.search, color: Color(0xFF475569)),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const SearchScreen()),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatusTabs''';

  content = content.replaceFirst(buildDateSelectorPattern, newDateSelector);

  file.writeAsStringSync(content);
}
