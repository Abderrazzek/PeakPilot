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
import Svg, { Line, Path } from 'react-native-svg';
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
  // Get tokens data from mock data
  const tokensData = useMemo(() => mockChartData.tokens, []);
  // Get penalties data from mock data
  const penaltiesData = useMemo(() => mockChartData.penalties, []);
  // Get metadata from mock data
  const metaData = useMemo(() => mockChartData.metadata, []);
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

  // Calculate X position for a given data point index in the chart
  const getXPositionForIndex = (index: number): number => {
    const leftPadding = 52;
    const rightPadding = 25;
    const dataAreaWidth = chartWidth - leftPadding - rightPadding;
    const spacingBetweenPoints = dataAreaWidth / 95;
    // X position = leftPadding + (index * spacing)
    return leftPadding + index * spacingBetweenPoints;
  };

  // Calculate Y position for a given data value in the chart
  // Chart height is 220, but data area is typically 180 (with padding)
  const getYPositionForValue = (
    value: number,
    applyCalibration: boolean = false,
  ): number => {
    const topPadding = 20; // Top padding for chart labels
    const dataAreaHeight = 180; // Height of data area
    const yCalibrationOffset = -11; // Adjust this value to move bottom boundary up (negative) or down (positive)

    // Find min and max values from all data (chart library includes all datasets)
    const allDataValues = [...quarterHourData, ...thresholdData];
    const minValue = Math.min(...allDataValues);
    const maxValue = Math.max(...allDataValues);

    // Calculate Y position (chart Y increases downward)
    // Y = topPadding + dataAreaHeight * (1 - (value - minValue) / (maxValue - minValue))
    if (maxValue === minValue) {
      const baseY = topPadding + dataAreaHeight / 2;
      return applyCalibration ? baseY + yCalibrationOffset : baseY;
    }
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    const baseY = topPadding + dataAreaHeight * (1 - normalizedValue);
    return applyCalibration ? baseY + yCalibrationOffset : baseY;
  };

  // Get consumption Y value at a given X position (for clipping hatched area to consumption line)
  // Uses cubic interpolation (Catmull-Rom spline) to better match chart library's bezier curves
  const getConsumptionYAtX = (xPosition: number): number => {
    // Convert X position to data index with calibration offset to match chart library
    const leftPadding = 52;
    const rightPadding = 25;
    const xCalibrationOffset = -11; // Fine-tuned offset to align X positions with chart rendering (adjusted 2px to the right)
    const dataAreaWidth = chartWidth - leftPadding - rightPadding;
    const spacingBetweenPoints = dataAreaWidth / 95;

    // Account for calibration offset to match chart library's actual rendering
    const dataAreaX = xPosition - leftPadding + xCalibrationOffset;
    const exactIndex = dataAreaX / spacingBetweenPoints;
    const dataIndex = Math.max(0, Math.min(95, exactIndex));

    // Use cubic interpolation (Catmull-Rom spline) for smoother curves that match bezier behavior
    const lowerIndex = Math.floor(dataIndex);
    const upperIndex = Math.min(95, Math.ceil(dataIndex));
    const t = dataIndex - lowerIndex;

    // Handle edge cases: if at exact data point, return that value directly
    if (t === 0) {
      return getYPositionForValue(quarterHourData[lowerIndex], true);
    }
    if (lowerIndex === upperIndex) {
      return getYPositionForValue(quarterHourData[lowerIndex], true);
    }

    // Get surrounding points for cubic interpolation (need 4 points: p0, p1, p2, p3)
    // Use more points for better curve approximation
    const p0Index = Math.max(0, lowerIndex - 1);
    const p1Index = lowerIndex;
    const p2Index = upperIndex;
    const p3Index = Math.min(95, upperIndex + 1);

    const p0 = quarterHourData[p0Index];
    const p1 = quarterHourData[p1Index];
    const p2 = quarterHourData[p2Index];
    const p3 = quarterHourData[p3Index];

    // Catmull-Rom spline interpolation with improved smoothness
    // This produces smoother curves that better match the chart library's bezier rendering
    const t2 = t * t;
    const t3 = t2 * t;

    // Catmull-Rom spline formula for smooth bezier-like curves
    const interpolatedValue =
      0.5 *
      (2 * p1 +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3);

    // Convert to Y position with calibration to match chart rendering
    return getYPositionForValue(interpolatedValue, true);
  };

  // Calculate collection window line positions
  // Morning: 6:00 AM - 9:00 AM (indices 24-35, so lines at 24 and 36)
  // Evening: 6:00 PM - 11:00 PM (indices 72-91, so lines at 72 and 92)
  const morningStartIndex = 6 * 4; // 24 (6:00 AM)
  const morningEndIndex = 9 * 4; // 36 (9:00 AM)
  const eveningStartIndex = 18 * 4; // 72 (6:00 PM)
  const eveningEndIndex = 22 * 4; // 92 (10:00 PM)

  const collectionWindowLines = [
    { x: getXPositionForIndex(morningStartIndex), label: '6:00 AM' },
    { x: getXPositionForIndex(morningEndIndex), label: '9:00 AM' },
    { x: getXPositionForIndex(eveningStartIndex), label: '6:00 PM' },
    { x: getXPositionForIndex(eveningEndIndex), label: '11:00 PM' },
  ];

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

  // Check if index is in collection window (6-9 AM or 18-22h)
  const isInCollectionWindow = (index: number) => {
    // 6-9 AM: indices 24-35 (6*4 to 9*4-1)
    // 18-22h: indices 72-87 (18*4 to 22*4-1)
    return (index >= 24 && index < 36) || (index >= 72 && index < 88);
  };

  // Get selected value details
  const getSelectedValueDetails = () => {
    if (selectedIndex === null) return null;

    const usage = quarterHourData[selectedIndex];
    if (usage === undefined || usage === null || isNaN(usage)) {
      return null;
    }

    const thresholdValue = threshold / 96;
    const isUnderLimit = usage < thresholdValue;
    const tokenValue = tokensData[selectedIndex] || 0;
    const hasPenalty = penaltiesData[selectedIndex] || false;
    const inCollectionWindow = isInCollectionWindow(selectedIndex);

    return {
      time: formatTimeFromIndex(selectedIndex),
      usage: usage.toFixed(3),
      threshold: thresholdValue.toFixed(3),
      isUnderLimit,
      difference: Math.abs(usage - thresholdValue).toFixed(3),
      tokens: tokenValue,
      hasPenalty,
      inCollectionWindow,
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
              <Text style={styles.consumptionUnit}>kW</Text>
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
          <Text style={styles.cardTitle}>
            Daily Consumption:{' '}
            <Text style={styles.cardTitleDate}>{metaData.date}</Text>
          </Text>
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
                {getSelectedValueDetails()?.time}
              </Text>
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
            </View>

            <View style={styles.selectedValueContent}>
              <View style={styles.selectedValueRow}>
                <View style={styles.selectedValueItem}>
                  <Text style={styles.selectedValueLabel}>Your Usage</Text>
                  <Text style={styles.selectedValueNumber}>
                    {getSelectedValueDetails()?.usage} kW
                  </Text>
                </View>
                <View style={styles.selectedValueDivider} />
                <View style={styles.selectedValueItem}>
                  <Text style={styles.selectedValueLabel}>Threshold</Text>
                  <Text style={styles.selectedValueNumber}>
                    {getSelectedValueDetails()?.threshold} kW
                  </Text>
                </View>
              </View>
              {getSelectedValueDetails()?.hasPenalty ? (
                <View style={styles.tokenValueContainer}>
                  <Text style={styles.penaltyText}>
                    Insufficient Tokens: A penalty will be applied
                  </Text>
                </View>
              ) : (getSelectedValueDetails()?.tokens ?? 0) !== 0 ? (
                <View style={styles.tokenValueContainer}>
                  <Coins color="#eab308" size={14} />
                  <Text style={styles.tokenValueText}>
                    {getSelectedValueDetails()?.tokens} token
                    {Math.abs(getSelectedValueDetails()?.tokens ?? 0) !== 1
                      ? 's'
                      : ''}
                  </Text>
                </View>
              ) : (
                <View style={styles.tokenValueContainer}>
                  <Text style={styles.outsideWindowText}>
                    Outside of collecting window
                  </Text>
                </View>
              )}
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

                {/* Collection Window Lines - Always visible, scrolls with chart */}
                <View
                  style={styles.collectionWindowLinesContainer}
                  pointerEvents="none"
                >
                  <Svg
                    height={220}
                    width={chartWidth}
                    style={styles.collectionWindowLinesSvg}
                  >
                    {/* Green background zone for 6 AM - 9 AM token collection window */}
                    {(() => {
                      const zoneStartX =
                        getXPositionForIndex(morningStartIndex);
                      const zoneEndX = getXPositionForIndex(morningEndIndex);
                      const zoneWidth = zoneEndX - zoneStartX;

                      // Get threshold Y value - use exact value from thresholdData
                      const thresholdValue = thresholdData[0]; // Same value used in chart
                      const thresholdYRaw =
                        getYPositionForValue(thresholdValue);
                      // Subtract offset to align with threshold line
                      const thresholdY = thresholdYRaw - 5;

                      // Create smooth green background Path that follows consumption line
                      // Path: start at threshold (top) -> follow consumption line smoothly -> close back to threshold
                      const pathPoints: string[] = [];

                      // Start at top-left (threshold line)
                      pathPoints.push(`M ${zoneStartX} ${thresholdY}`);

                      // Sample extremely densely for ultra-smooth bezier-like curve that matches the chart line
                      // Very high sample count creates smoother curves that perfectly follow the chart's bezier rendering
                      const sampleCount = Math.max(
                        800,
                        Math.floor(zoneWidth * 8),
                      );
                      for (let i = 0; i <= sampleCount; i++) {
                        const t = i / sampleCount;
                        // Calculate X position with proper calibration
                        const x = zoneStartX + t * zoneWidth;

                        // Get consumption Y position - this should exactly match the line chart
                        // Using calibrated X position to match chart library rendering
                        const consumptionY = getConsumptionYAtX(x);

                        // Use consumption Y directly to match the consumption line chart exactly
                        // This ensures the bottom boundary follows the consumption line values precisely
                        pathPoints.push(`L ${x} ${consumptionY}`);
                      }

                      // Close path back to threshold line at right edge
                      pathPoints.push(`L ${zoneEndX} ${thresholdY}`);
                      pathPoints.push('Z');

                      const backgroundPath = pathPoints.join(' ');

                      return (
                        <>
                          {/* Green background - fills area between threshold and consumption line */}
                          <Path
                            d={backgroundPath}
                            fill="#22c55e"
                            opacity={0.4}
                          />
                        </>
                      );
                    })()}

                    {/* Colored background zone for 6 PM - 10 PM (18:00 - 22:00) token collection window */}
                    {(() => {
                      const zoneStartX =
                        getXPositionForIndex(eveningStartIndex);
                      const zoneEndX = getXPositionForIndex(eveningEndIndex);
                      const zoneWidth = zoneEndX - zoneStartX;

                      // Get threshold Y value - use exact value from thresholdData
                      const thresholdValue = thresholdData[0]; // Same value used in chart
                      const thresholdYRaw =
                        getYPositionForValue(thresholdValue);
                      // Subtract offset to align with threshold line
                      const thresholdY = thresholdYRaw - 5;

                      // Convert X position to data index
                      const xToIndex = (x: number): number => {
                        const leftPadding = 52;
                        const rightPadding = 25;
                        const xCalibrationOffset = -11;
                        const dataAreaWidth =
                          chartWidth - leftPadding - rightPadding;
                        const spacingBetweenPoints = dataAreaWidth / 95;
                        const dataAreaX = x - leftPadding + xCalibrationOffset;
                        const exactIndex = dataAreaX / spacingBetweenPoints;
                        return Math.max(
                          0,
                          Math.min(95, Math.floor(exactIndex + 0.2)),
                        );
                      };

                      // Sample extremely densely for ultra-smooth bezier-like curve that matches the chart line
                      const sampleCount = Math.max(
                        800,
                        Math.floor(zoneWidth * 8),
                      );

                      // Create segments based on penalty values
                      const segments: Array<{
                        startX: number;
                        endX: number;
                        penalty: boolean;
                        pathPoints: string[];
                      }> = [];

                      let currentSegment: {
                        startX: number;
                        penalty: boolean | null;
                        pathPoints: string[];
                      } | null = null;

                      for (let i = 0; i <= sampleCount; i++) {
                        const t = i / sampleCount;
                        const x = zoneStartX + t * zoneWidth;
                        const dataIndex = xToIndex(x);

                        // Only process if within evening window (indices 72-88)
                        if (
                          dataIndex < eveningStartIndex ||
                          dataIndex > eveningEndIndex
                        ) {
                          continue;
                        }

                        // Get consumption Y position
                        const consumptionY = getConsumptionYAtX(x);

                        // Check if consumption is above threshold
                        const isAboveThreshold = consumptionY < thresholdY;

                        // Only create fill if above threshold
                        if (isAboveThreshold) {
                          const hasPenalty = penaltiesData[dataIndex] || false;

                          // Start new segment if penalty value changes or no current segment
                          if (
                            !currentSegment ||
                            currentSegment.penalty !== hasPenalty
                          ) {
                            // Save previous segment if exists
                            if (
                              currentSegment &&
                              currentSegment.penalty !== null
                            ) {
                              // Close previous segment at threshold
                              currentSegment.pathPoints.push(
                                `L ${x} ${thresholdY}`,
                              );
                              currentSegment.pathPoints.push('Z');

                              segments.push({
                                startX: currentSegment.startX,
                                endX: x,
                                penalty: currentSegment.penalty,
                                pathPoints: [...currentSegment.pathPoints],
                              });
                            }

                            // Start new segment at threshold line
                            currentSegment = {
                              startX: x,
                              penalty: hasPenalty,
                              pathPoints: [`M ${x} ${thresholdY}`],
                            };
                          }

                          // Add point to current segment following consumption line
                          if (currentSegment) {
                            currentSegment.pathPoints.push(
                              `L ${x} ${consumptionY}`,
                            );
                          }
                        } else {
                          // Below threshold - close current segment if exists
                          if (
                            currentSegment &&
                            currentSegment.penalty !== null
                          ) {
                            // Close segment at threshold line
                            currentSegment.pathPoints.push(
                              `L ${x} ${thresholdY}`,
                            );
                            currentSegment.pathPoints.push('Z');

                            segments.push({
                              startX: currentSegment.startX,
                              endX: x,
                              penalty: currentSegment.penalty,
                              pathPoints: [...currentSegment.pathPoints],
                            });
                            currentSegment = null;
                          }
                        }
                      }

                      // Close last segment if exists
                      if (currentSegment && currentSegment.penalty !== null) {
                        // Close segment at threshold line
                        currentSegment.pathPoints.push(
                          `L ${zoneEndX} ${thresholdY}`,
                        );
                        currentSegment.pathPoints.push('Z');

                        segments.push({
                          startX: currentSegment.startX,
                          endX: zoneEndX,
                          penalty: currentSegment.penalty,
                          pathPoints: [...currentSegment.pathPoints],
                        });
                      }

                      // Create base green path for all areas above threshold (original behavior)
                      // This matches the original green fill implementation
                      const greenPathPoints: string[] = [];
                      greenPathPoints.push(`M ${zoneStartX} ${thresholdY}`);

                      for (let i = 0; i <= sampleCount; i++) {
                        const t = i / sampleCount;
                        const x = zoneStartX + t * zoneWidth;
                        const consumptionY = getConsumptionYAtX(x);
                        // Follow consumption line (will be clipped by penalty overlays)
                        greenPathPoints.push(`L ${x} ${consumptionY}`);
                      }

                      // Close green path back to threshold line at right edge
                      greenPathPoints.push(`L ${zoneEndX} ${thresholdY}`);
                      greenPathPoints.push('Z');
                      const greenBackgroundPath = greenPathPoints.join(' ');

                      // Render both green base and penalty-based colored segments
                      return (
                        <>
                          {/* Green background - fills area between threshold and consumption line (original behavior) */}
                          <Path
                            d={greenBackgroundPath}
                            fill="#22c55e"
                            opacity={0.4}
                          />
                          {/* Penalty-based colored segments overlay */}
                          {segments.map((segment, idx) => {
                            const closedPath = segment.pathPoints.join(' ');

                            // Determine color based on penalty value
                            // Orange if penalty is false, Red if penalty is true
                            const fillColor = segment.penalty
                              ? '#ef4444'
                              : '#f97316'; // Red : Orange

                            return (
                              <Path
                                key={`evening-segment-${idx}`}
                                d={closedPath}
                                fill={fillColor}
                                opacity={0.4}
                              />
                            );
                          })}
                        </>
                      );
                    })()}

                    {/* Collection window boundary lines */}
                    {collectionWindowLines.map((line, index) => (
                      <Line
                        key={index}
                        x1={line.x}
                        y1={0}
                        x2={line.x}
                        y2={180}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        strokeDasharray="4,4"
                        opacity={0.6}
                      />
                    ))}
                  </Svg>
                </View>
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
          <Text style={styles.tokenWindowTimes}>⏰ 6-9 AM & 6-10 PM</Text>
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
                <Text style={styles.infoValue}>6-9 AM & 6-10 PM</Text>
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
  cardTitleDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9ca3af',
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
  collectionWindowLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 220,
    width: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  },
  collectionWindowLinesSvg: {
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
  tokenValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  tokenValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#eab308',
  },
  penaltyText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fca5a5',
  },
  outsideWindowText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9ca3af',
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
