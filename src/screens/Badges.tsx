import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Award,
  Trophy,
  Sparkles,
  Star,
  Check,
  Zap,
  Moon,
  Target,
  Flame,
} from 'lucide-react-native';

const unlockedBadges = [
  {
    id: 1,
    name: 'Energy Saver',
    description: 'Stay below threshold for 7 consecutive days',
    reward: 50,
    unlockDate: 'Nov 27, 2025',
    gradient: ['#06b6d4', '#0891b2'],
    icon: Zap,
    dotColor: '#3b82f6',
  },
  {
    id: 2,
    name: 'First Steps',
    description: 'Complete your first day below threshold',
    reward: 10,
    unlockDate: 'Nov 20, 2025',
    gradient: ['#3b82f6', '#1e40af'],
    icon: Check,
    dotColor: '#9ca3af',
  },
  {
    id: 3,
    name: 'Early Bird',
    description: 'Shift 80% usage to morning hours',
    reward: 60,
    unlockDate: 'Nov 18, 2025',
    gradient: ['#3b82f6', '#6366f1'],
    icon: Star,
    dotColor: '#3b82f6',
  },
  {
    id: 4,
    name: 'Night Owl',
    description: 'Complete 5 night challenges',
    reward: 75,
    unlockDate: 'Nov 25, 2025',
    gradient: ['#8b5cf6', '#6d28d9'],
    icon: Moon,
    dotColor: '#8b5cf6',
  },
  {
    id: 5,
    name: 'Power Surge',
    description: 'Save 50 kWh in a single week',
    reward: 100,
    unlockDate: 'Nov 22, 2025',
    gradient: ['#f59e0b', '#d97706'],
    icon: Zap,
    dotColor: '#3b82f6',
  },
];

const lockedBadges = [
  {
    id: 6,
    name: 'Green Warrior',
    description: 'Stay below threshold for 30 consecutive days',
    reward: 200,
    progress: 83,
    progressText: 'Just 5 days to unlock!',
    gradient: ['#22c55e', '#16a34a'],
    icon: Target,
    progressColor: '#22c55e',
  },
  {
    id: 7,
    name: 'Token Master',
    description: 'Earn 1000 tokens in total',
    reward: 150,
    progress: 65,
    progressText: '350 more tokens needed',
    gradient: ['#8b5cf6', '#6d28d9'],
    icon: Star,
    progressColor: '#8b5cf6',
  },
  {
    id: 8,
    name: 'Efficiency Expert',
    description: 'Reduce consumption by 20% vs previous',
    reward: 250,
    progress: 45,
    progressText: '11% more reduction needed',
    gradient: ['#f59e0b', '#d97706'],
    icon: Trophy,
    progressColor: '#3b82f6',
  },
  {
    id: 9,
    name: 'Hot Streak',
    description: 'Maintain 14-day energy saving streak',
    reward: 125,
    progress: 71,
    progressText: '4-day streak, keep going for 10 more days',
    gradient: ['#ec4899', '#be185d'],
    icon: Flame,
    progressColor: '#3b82f6',
  },
];

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const unlockedCount = unlockedBadges.length;
  const totalCount = unlockedCount + lockedBadges.length;
  const totalTokens = 295;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <LinearGradient
            colors={['#8b5cf6', '#ec4899']}
            style={styles.headerIcon}
          >
            <Award color="#ffffff" size={32} />
          </LinearGradient>
        </View>
        <Text style={styles.headerTitle}>Badge Collection</Text>
        <Text style={styles.headerSubtitle}>Showcase your achievements</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Trophy color="#f59e0b" size={24} />
          <Text style={styles.summaryValue}>{unlockedCount}</Text>
          <Text style={styles.summaryLabel}>Unlocked</Text>
        </View>
        <View style={styles.summaryCard}>
          <Sparkles color="#60a5fa" size={24} />
          <Text style={styles.summaryValue}>{totalCount}</Text>
          <Text style={styles.summaryLabel}>Total Badges</Text>
        </View>
        <View style={styles.summaryCard}>
          <Star color="#f59e0b" size={24} />
          <Text style={styles.summaryValue}>{totalTokens}</Text>
          <Text style={styles.summaryLabel}>Tokens</Text>
        </View>
      </View>

      {/* Unlocked Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Unlocked Achievements</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>{unlockedCount} badges</Text>
          </View>
        </View>

        <View style={styles.badgeGrid}>
          {unlockedBadges.map(badge => {
            const Icon = badge.icon;
            return (
              <TouchableOpacity key={badge.id} style={styles.badgeCard}>
                <View style={styles.badgeCardHeader}>
                  <View
                    style={[
                      styles.badgeDot,
                      { backgroundColor: badge.dotColor },
                    ]}
                  />
                </View>
                <LinearGradient
                  colors={badge.gradient}
                  style={styles.badgeIconContainer}
                >
                  <Icon color="#ffffff" size={32} />
                </LinearGradient>
                <Text style={styles.badgeCardTitle}>{badge.name}</Text>
                <Text style={styles.badgeCardDescription}>
                  {badge.description}
                </Text>
                <View style={styles.badgeReward}>
                  <Star color="#f59e0b" size={14} />
                  <Text style={styles.badgeRewardText}>
                    +{badge.reward} tokens
                  </Text>
                </View>
                <Text style={styles.badgeUnlockDate}>
                  Unlocked {badge.unlockDate}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Locked Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Locked Achievements</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>
              {lockedBadges.length} remaining
            </Text>
          </View>
        </View>

        <View style={styles.lockedBadgeGrid}>
          {lockedBadges.map(badge => {
            const Icon = badge.icon;
            return (
              <TouchableOpacity key={badge.id} style={styles.lockedBadgeCard}>
                <View style={styles.lockedBadgeHeader}>
                  <View style={styles.lockedBadgeIconContainer}>
                    <Icon color="#6b7280" size={28} />
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground} />
                    <LinearGradient
                      colors={[badge.progressColor, badge.progressColor]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.progressBarFill,
                        { width: `${badge.progress}%` },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.lockedBadgeTitle}>{badge.name}</Text>
                <Text style={styles.lockedBadgeDescription}>
                  {badge.description}
                </Text>
                <View style={styles.lockedBadgeProgress}>
                  <View style={styles.progressPill}>
                    <Text style={styles.progressPillText}>
                      {badge.progress}% Complete
                    </Text>
                  </View>
                  <Text style={styles.progressText}>{badge.progressText}</Text>
                </View>
                <View style={styles.lockedBadgeReward}>
                  <Star color="#8b5cf6" size={14} />
                  <Text style={styles.lockedBadgeRewardText}>
                    +{badge.reward} tokens
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Keep Going Card */}
      <View style={styles.keepGoingCard}>
        <LinearGradient
          colors={['#1e1b4b', '#312e81']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.keepGoingContent}>
          <View style={styles.keepGoingHeader}>
            <Sparkles color="#a78bfa" size={20} />
            <Text style={styles.keepGoingTitle}>Keep Going! 🚀</Text>
          </View>
          <Text style={styles.keepGoingText}>
            You're doing amazing! Only {lockedBadges.length} more badges to
            collect. Each achievement brings you closer to becoming an Energy
            Master.
          </Text>
          <View style={styles.masterProgressContainer}>
            <View style={styles.masterProgressBarBackground} />
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.masterProgressBarFill, { width: '56%' }]}
            />
          </View>
          <Text style={styles.masterProgressText}>
            56% towards Energy Master
          </Text>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerIconContainer: {
    marginBottom: 16,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  badgePill: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgePillText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    position: 'relative',
  },
  badgeCardHeader: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  badgeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  badgeCardDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  badgeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    gap: 4,
  },
  badgeRewardText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  badgeUnlockDate: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  lockedBadgeGrid: {
    gap: 16,
  },
  lockedBadgeCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  lockedBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  lockedBadgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    position: 'relative',
  },
  progressBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1f2937',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  lockedBadgeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  lockedBadgeDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
    lineHeight: 20,
  },
  lockedBadgeProgress: {
    marginBottom: 12,
  },
  progressPill: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  progressPillText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  lockedBadgeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockedBadgeRewardText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  keepGoingCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  keepGoingContent: {
    padding: 20,
  },
  keepGoingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  keepGoingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  keepGoingText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 16,
  },
  masterProgressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
    position: 'relative',
  },
  masterProgressBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  masterProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  masterProgressText: {
    fontSize: 12,
    color: '#a78bfa',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});
