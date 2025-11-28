import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Zap, Coins, Lightbulb, Info, Clock } from 'lucide-react-native';
import Svg, { Line } from 'react-native-svg';
import mockChartData from '../data/mockChartData.json';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const currentUsage = 24.6;
  // Get threshold from mock data (will be replaced with API data later)
  const threshold = mockChartData.threshold;
  const isUnderThreshold = currentUsage < threshold;
  const tokensEarned = isUnderThreshold ? 15 : 0;
  const penalty = !isUnderThreshold ? 8 : 0;
  // Initialize with index 0 to show the box from the beginning
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Generate quarter-hour labels for one full day (96 intervals)
  // Provide 96 labels but only show text for every hour (every 4th label) for readability
  const generateQuarterHourLabels = () => {
    const labels = [];
    for (let i = 0; i < 96; i++) {
      const hour = Math.floor(i / 4);
      // Only show label text at the start of each hour (i % 4 === 0)
      if (i % 4 === 0) {
        labels.push(`${hour.toString().padStart(2, '0')}:00`);
      } else {
        labels.push(''); // Empty string for other quarters
      }
    }
    return labels;
  };

  // Get consumption data from mock data (will be replaced with API call later)
  // TODO: Replace with API call: const quarterHourData = await fetchDailyConsumption();
  const quarterHourData = useMemo(() => mockChartData.dailyConsumption, []);
  // Threshold data: threshold per day / 96 quarter-hours = threshold per quarter hour
  // TODO: Replace with API data when available
  const thresholdData = useMemo(
    () => Array(96).fill(threshold / 96),
    [threshold],
  );

  // Calculate chart width: 96 data points * 18 pixels per point for better spacing
  // This gives us ~1728 pixels width, ensuring more space between values
  const chartWidth = Math.max(screenWidth - 48, 96 * 18);

  // Calculate padding to allow first and last values to be centered
  // Padding should be half the visible width on each side
  const visibleChartWidth = screenWidth - 48;
  const scrollPadding = visibleChartWidth / 2;

  // Format time from index (quarter-hour index to time string)
  const formatTimeFromIndex = (index: number): string => {
    const hour = Math.floor(index / 4);
    const quarter = (index % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${quarter
      .toString()
      .padStart(2, '0')}`;
  };

  const scrollViewRef = useRef<ScrollView>(null);
  const isScrollingRef = useRef(false);
  const scrollOffsetRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const touchStartXRef = useRef(0);
  // Initialize with index 0 to show the dashed line from the beginning
  const [currentScrollIndex, setCurrentScrollIndex] = useState<number>(0);

  // Calculate which data point is at a given X position in the chart
  const calculateIndexFromXPosition = (xPosition: number) => {
    // Chart padding (react-native-chart-kit adds padding for labels/axes)
    // Fine-tuned to match actual chart rendering
    const leftPadding = 52; // Space for Y-axis labels
    const rightPadding = 25; // Right margin for X-axis labels
    const calibrationOffset = -12; // Fine-tune adjustment to align with data points

    // Account for left padding and calibration offset to get position in data area
    const dataAreaX = xPosition - leftPadding + calibrationOffset;

    // Data area width (where actual data points are rendered)
    const dataAreaWidth = chartWidth - leftPadding - rightPadding;

    // Handle edge cases
    if (dataAreaX < 0) return 0;
    if (dataAreaX >= dataAreaWidth) return 95;

    // Calculate spacing: 96 points create 95 intervals
    const spacingBetweenPoints = dataAreaWidth / 95;

    // Calculate which data point is at this position
    // Point 0 is at leftPadding, point 95 is at leftPadding + dataAreaWidth
    const rawIndex = dataAreaX / spacingBetweenPoints;
    // Use floor with small offset to prevent rounding to next index
    const index = Math.floor(rawIndex + 0.2);

    // Clamp between 0 and 95
    return Math.max(0, Math.min(95, index));
  };

  // Calculate which data point is at the center of the visible area
  const calculateCenterIndex = (scrollX: number) => {
    // Center of visible chart area
    const visibleCenterX = visibleChartWidth / 2;
    // Account for scroll padding - the chart content starts after the padding
    // Absolute position in the chart (scroll position + center of visible area - padding offset)
    const absoluteX = scrollX + visibleCenterX - scrollPadding;

    // Use unified calculation function
    return calculateIndexFromXPosition(absoluteX);
  };

  // Handle scroll to update selected value based on center position
  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    scrollOffsetRef.current = scrollX;

    // Calculate which data point is at the center
    const centerIndex = calculateCenterIndex(scrollX);
    setCurrentScrollIndex(centerIndex);
    setSelectedIndex(centerIndex);
  };

  // Handle touch on chart to show values
  const handleChartTouchStart = (evt: any) => {
    const { locationX } = evt.nativeEvent;
    touchStartTimeRef.current = Date.now();
    touchStartXRef.current = locationX;
  };

  const handleChartTouchEnd = (evt: any) => {
    // Don't update if user is scrolling
    if (isScrollingRef.current) return;

    const touchDuration = Date.now() - touchStartTimeRef.current;
    const { locationX } = evt.nativeEvent;
    const touchDistance = Math.abs(locationX - touchStartXRef.current);

    // Only treat as tap if it's quick (< 200ms) and didn't move much (< 10px)
    if (touchDuration < 200 && touchDistance < 10) {
      // Add scroll offset to get absolute position in chart
      const absoluteX = locationX + scrollOffsetRef.current;
      // Use unified calculation function
      const index = calculateIndexFromXPosition(absoluteX);
      setSelectedIndex(index);
      setCurrentScrollIndex(index);
    }
  };

  // Get selected value details
  const getSelectedValueDetails = () => {
    if (selectedIndex === null) return null;

    const usage = quarterHourData[selectedIndex];
    const thresholdValue = threshold / 96;
    const isUnderLimit = usage < thresholdValue;

    return {
      time: formatTimeFromIndex(selectedIndex),
      usage: usage.toFixed(3),
      threshold: thresholdValue.toFixed(3),
      isUnderLimit,
      difference: Math.abs(usage - thresholdValue).toFixed(3),
    };
  };

  // Memoize labels to prevent regeneration on each render
  const chartLabels = useMemo(() => generateQuarterHourLabels(), []);

  // Memoize chartData to prevent regeneration on each render
  const chartData = useMemo(
    () => ({
      labels: chartLabels,
      datasets: [
        {
          data: quarterHourData,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: thresholdData,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 2,
          withDots: false,
        },
      ],
    }),
    [chartLabels, quarterHourData, thresholdData],
  );

  const chartConfig = {
    backgroundColor: '#1f2937',
    backgroundGradientFrom: '#1f2937',
    backgroundGradientTo: '#111827',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Peak Pilot</Text>
        <Text style={styles.subtitle}>Track your energy, earn rewards</Text>
      </View>

      {/* Status Card */}
      <View
        style={[
          styles.card,
          isUnderThreshold ? styles.cardSuccess : styles.cardWarning,
        ]}
      >
        <View style={styles.statusContent}>
          <View style={styles.consumptionInfo}>
            <Text style={styles.consumptionLabel}>Yesterday's Consumption</Text>
            <View style={styles.consumptionValueContainer}>
              <Text
                style={[
                  styles.consumptionValue,
                  isUnderThreshold ? styles.textSuccess : styles.textDanger,
                ]}
              >
                {currentUsage.toFixed(1)}
              </Text>
              <Text style={styles.consumptionUnit}>kWh</Text>
            </View>
            <Text style={styles.thresholdLimit}>/ {threshold} kWh limit</Text>
          </View>

          <View style={styles.tokenInfo}>
            <Coins color={isUnderThreshold ? '#eab308' : '#6b7280'} size={20} />
            <Text
              style={[
                styles.tokenValue,
                isUnderThreshold ? styles.textSuccess : styles.textDanger,
              ]}
            >
              {isUnderThreshold ? `+${tokensEarned}` : `-${penalty}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Next Action Card */}
      <View style={styles.nextActionCard}>
        <View style={styles.nextActionIconContainer}>
          <Lightbulb color="#ffffff" size={24} />
        </View>

        <View style={styles.nextActionContent}>
          <View style={styles.nextActionHeader}>
            <Text style={styles.nextActionTitle}>Next Action</Text>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI Recommended</Text>
            </View>
          </View>

          <Text style={styles.nextActionMessage}>
            💡 Delay running your dishwasher until 6 PM to earn 3 extra tokens
            during the evening collection window.
          </Text>

          <View style={styles.nextActionFooter}>
            <View style={styles.potentialReward}>
              <Coins color="#eab308" size={16} />
              <Text style={styles.potentialRewardText}>
                +3 tokens potential
              </Text>
            </View>

            <TouchableOpacity style={styles.gotItButton}>
              <Text style={styles.gotItButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Daily Consumption Chart */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Daily Consumption</Text>
        </View>

        {/* Selected Value Display - Always visible */}
        {getSelectedValueDetails() && (
          <View
            style={[
              styles.selectedValueCard,
              getSelectedValueDetails()?.isUnderLimit
                ? styles.selectedValueCardSuccess
                : styles.selectedValueCardWarning,
            ]}
          >
            <View style={styles.selectedValueHeader}>
              <Text style={styles.selectedValueTitle}>
                Selected Time: {getSelectedValueDetails()?.time}
              </Text>
            </View>

            <View style={styles.selectedValueContent}>
              <View style={styles.selectedValueRow}>
                <View style={styles.selectedValueItem}>
                  <Text style={styles.selectedValueLabel}>Your Usage</Text>
                  <Text style={styles.selectedValueNumber}>
                    {getSelectedValueDetails()?.usage} kWh
                  </Text>
                </View>
                <View style={styles.selectedValueDivider} />
                <View style={styles.selectedValueItem}>
                  <Text style={styles.selectedValueLabel}>Threshold</Text>
                  <Text style={styles.selectedValueNumber}>
                    {getSelectedValueDetails()?.threshold} kWh
                  </Text>
                </View>
              </View>

              <View style={styles.selectedValueStatusRow}>
                <Text style={styles.selectedValueStatusLabel}>Status:</Text>
                <View
                  style={[
                    styles.selectedValueStatusBadge,
                    getSelectedValueDetails()?.isUnderLimit
                      ? styles.selectedValueStatusBadgeSuccess
                      : styles.selectedValueStatusBadgeWarning,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectedValueStatusText,
                      getSelectedValueDetails()?.isUnderLimit
                        ? styles.selectedValueStatusTextSuccess
                        : styles.selectedValueStatusTextWarning,
                    ]}
                  >
                    {getSelectedValueDetails()?.isUnderLimit
                      ? '✓ Under Limit'
                      : '⚠ Over Limit'}
                  </Text>
                </View>
                <Text style={styles.selectedValueDifference}>
                  ({getSelectedValueDetails()?.isUnderLimit ? '-' : '+'}
                  {getSelectedValueDetails()?.difference} kWh)
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.chartContainer}>
          <View style={styles.chartWrapper}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.chartScrollContainer,
                {
                  paddingLeft: scrollPadding,
                  paddingRight: scrollPadding,
                },
              ]}
              style={styles.chartScrollView}
              scrollEventThrottle={16}
              onScroll={handleScroll}
              onScrollBeginDrag={() => {
                isScrollingRef.current = true;
              }}
              onScrollEndDrag={() => {
                setTimeout(() => {
                  isScrollingRef.current = false;
                }, 100);
              }}
              onMomentumScrollEnd={() => {
                setTimeout(() => {
                  isScrollingRef.current = false;
                }, 100);
              }}
            >
              <View
                style={styles.chartTouchArea}
                onTouchStart={handleChartTouchStart}
                onTouchEnd={handleChartTouchEnd}
              >
                <LineChart
                  data={chartData}
                  width={chartWidth}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                />
              </View>
            </ScrollView>

            {/* Dashed Vertical Line Indicator */}
            {currentScrollIndex !== null && (
              <View style={styles.verticalLineContainer} pointerEvents="none">
                <Svg
                  height={220}
                  width={screenWidth - 48}
                  style={styles.verticalLineSvg}
                >
                  <Line
                    x1={(screenWidth - 48) / 2}
                    y1={0}
                    x2={(screenWidth - 48) / 2}
                    y2={180}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                    opacity={0.8}
                  />
                </Svg>
              </View>
            )}
          </View>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.legendText}>Your Usage</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Threshold</Text>
          </View>
        </View>

        {/* Token Collection Info */}
        <View style={styles.tokenWindowInfo}>
          <View style={styles.tokenWindowBadge}>
            <Text style={styles.tokenWindowEmoji}>🪙</Text>
            <Text style={styles.tokenWindowText}>Token Collection Windows</Text>
          </View>
          <Text style={styles.tokenWindowTimes}>⏰ 6-9 AM & 6-11 PM</Text>
        </View>
      </View>

      {/* How Token Collection Works - Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Info color="#eab308" size={20} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>How to Earn Tokens</Text>

          <View style={styles.infoSection}>
            <Clock color="#eab308" size={16} style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoHighlight}>
                Token Collection Windows:{' '}
                <Text style={styles.infoValue}>6-9 AM & 6-11 PM</Text>
              </Text>
              <Text style={styles.infoSubtext}>
                Stay below your threshold during these times to earn tokens
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Zap color="#60a5fa" size={16} style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoHighlight}>
                Outside Windows:{' '}
                <Text style={styles.infoValue}>Use energy freely</Text>
              </Text>
              <Text style={styles.infoSubtext}>
                Consumption outside these windows doesn't affect tokens
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>842</Text>
          <Text style={styles.statLabel}>Total Tokens</Text>
          <Coins color="#eab308" size={20} style={styles.statIcon} />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
          </View>
        </View>
      </View>

      <View style={[styles.bottomPadding, { paddingBottom: insets.bottom }]} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardSuccess: {
    backgroundColor: 'rgba(6, 78, 59, 0.4)',
    borderColor: 'rgba(5, 150, 105, 0.5)',
  },
  cardWarning: {
    backgroundColor: 'rgba(127, 29, 29, 0.4)',
    borderColor: 'rgba(185, 28, 28, 0.5)',
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  consumptionInfo: {
    flex: 1,
  },
  consumptionLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  consumptionValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  consumptionValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  consumptionUnit: {
    fontSize: 20,
    color: '#9ca3af',
    marginLeft: 4,
  },
  textSuccess: {
    color: '#86efac',
  },
  textDanger: {
    color: '#fca5a5',
  },
  thresholdLimit: {
    fontSize: 14,
    color: '#9ca3af',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: 'rgba(120, 53, 15, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(161, 98, 7, 0.5)',
    flexDirection: 'row',
    gap: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoHighlight: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 4,
  },
  infoValue: {
    color: '#eab308',
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  nextActionCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4338ca',
    flexDirection: 'row',
    gap: 16,
  },
  nextActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextActionContent: {
    flex: 1,
  },
  nextActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nextActionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  aiBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  aiBadgeText: {
    fontSize: 10,
    color: '#d8b4fe',
  },
  nextActionMessage: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 12,
    lineHeight: 20,
  },
  nextActionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  potentialReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  potentialRewardText: {
    fontSize: 14,
    color: '#eab308',
  },
  gotItButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  gotItButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  chartHint: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  chartContainer: {
    position: 'relative',
  },
  chartWrapper: {
    position: 'relative',
  },
  chartScrollView: {
    marginTop: 0,
    marginBottom: 8,
  },
  chartScrollContainer: {
    paddingRight: 16,
  },
  chartTouchArea: {
    position: 'relative',
  },
  chart: {
    borderRadius: 16,
  },
  verticalLineContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  verticalLineSvg: {
    position: 'absolute',
  },
  selectedValueCard: {
    marginTop: 12,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  selectedValueCardSuccess: {
    backgroundColor: 'rgba(6, 78, 59, 0.3)',
    borderColor: 'rgba(5, 150, 105, 0.6)',
  },
  selectedValueCardWarning: {
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
    borderColor: 'rgba(185, 28, 28, 0.6)',
  },
  selectedValueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedValueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  selectedValueClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedValueCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  selectedValueContent: {
    gap: 12,
  },
  selectedValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  selectedValueItem: {
    flex: 1,
    alignItems: 'center',
  },
  selectedValueDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#374151',
    marginHorizontal: 16,
  },
  selectedValueLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  selectedValueNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  selectedValueStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  selectedValueStatusLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  selectedValueStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedValueStatusBadgeSuccess: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.4)',
  },
  selectedValueStatusBadgeWarning: {
    backgroundColor: 'rgba(185, 28, 28, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.4)',
  },
  selectedValueStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedValueStatusTextSuccess: {
    color: '#86efac',
  },
  selectedValueStatusTextWarning: {
    color: '#fca5a5',
  },
  selectedValueDifference: {
    fontSize: 12,
    color: '#9ca3af',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  tokenWindowInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  tokenWindowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tokenWindowEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  tokenWindowText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  tokenWindowTimes: {
    fontSize: 14,
    color: '#eab308',
    textAlign: 'center',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    position: 'relative',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  streakBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  streakEmoji: {
    fontSize: 24,
  },
  bottomPadding: {
    height: 24,
  },
});
