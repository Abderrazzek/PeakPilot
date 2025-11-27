import React from 'react';
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

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const currentUsage = 24.6;
  const threshold = 30;
  const isUnderThreshold = currentUsage < threshold;
  const tokensEarned = isUnderThreshold ? 15 : 0;
  const penalty = !isUnderThreshold ? 8 : 0;

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [25, 28, 24, 26, 29, 27, 28.5],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: [30, 30, 30, 30, 30, 30, 30],
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        strokeWidth: 2,
        withDots: false,
      },
    ],
  };

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
        <Text style={styles.title}>Smart Energy Companion</Text>
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
        <Text style={styles.cardTitle}>Daily Consumption</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 48}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
