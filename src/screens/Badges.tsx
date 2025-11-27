import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Award, Lock } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

const badges = [
  {
    id: 1,
    name: 'First Steps',
    description: 'Complete your first day below threshold',
    rarity: 'common',
    unlocked: true,
    gradient: ['#3b82f6', '#1e40af'],
    glow: '#3b82f6',
  },
  {
    id: 2,
    name: 'Week Warrior',
    description: 'Stay below threshold for 7 consecutive days',
    rarity: 'rare',
    unlocked: true,
    gradient: ['#8b5cf6', '#6d28d9'],
    glow: '#8b5cf6',
  },
  {
    id: 3,
    name: 'Energy Saver',
    description: 'Save 100 kWh in a month',
    rarity: 'epic',
    unlocked: true,
    gradient: ['#ec4899', '#be185d'],
    glow: '#ec4899',
  },
  {
    id: 4,
    name: 'Token Master',
    description: 'Earn 1000 tokens',
    rarity: 'legendary',
    unlocked: false,
    gradient: ['#f59e0b', '#d97706'],
    glow: '#f59e0b',
  },
  {
    id: 5,
    name: 'Eco Champion',
    description: 'Stay below threshold for 30 consecutive days',
    rarity: 'legendary',
    unlocked: false,
    gradient: ['#22c55e', '#16a34a'],
    glow: '#22c55e',
  },
  {
    id: 6,
    name: 'Community Helper',
    description: 'Transfer tokens to 5 different users',
    rarity: 'rare',
    unlocked: false,
    gradient: ['#06b6d4', '#0891b2'],
    glow: '#06b6d4',
  },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return '#6b7280';
    case 'rare':
      return '#8b5cf6';
    case 'epic':
      return '#ec4899';
    case 'legendary':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

export default function BadgesScreen() {
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <ScrollView style={styles.container}>
      {/* Hero Header */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Badge Collection</Text>
        <Text style={styles.heroSubtitle}>
          Earn badges by achieving energy-saving milestones
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completionPercentage}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </View>

      {/* Badge Grid */}
      <View style={styles.badgeGrid}>
        {badges.map((badge) => (
          <TouchableOpacity
            key={badge.id}
            style={styles.badgeCard}
            activeOpacity={0.8}
          >
            {badge.unlocked ? (
              <View style={styles.badgeIconContainer}>
                <LinearGradient
                  colors={badge.gradient}
                  style={[
                    styles.badgeIcon,
                    {
                      shadowColor: badge.glow,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.6,
                      shadowRadius: 12,
                      elevation: 8,
                    },
                  ]}
                >
                  <Award color="#ffffff" size={32} />
                </LinearGradient>
              </View>
            ) : (
              <View style={[styles.badgeIcon, styles.lockedBadge]}>
                <Lock color="#6b7280" size={32} />
              </View>
            )}

            <View style={styles.badgeContent}>
              <View style={styles.badgeHeader}>
                <Text
                  style={[
                    styles.badgeName,
                    !badge.unlocked && styles.lockedText,
                  ]}
                >
                  {badge.name}
                </Text>
                <View
                  style={[
                    styles.rarityBadge,
                    { backgroundColor: getRarityColor(badge.rarity) + '33' },
                  ]}
                >
                  <Text
                    style={[
                      styles.rarityText,
                      { color: getRarityColor(badge.rarity) },
                    ]}
                  >
                    {badge.rarity.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.badgeDescription,
                  !badge.unlocked && styles.lockedText,
                ]}
              >
                {badge.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
  },
  badgeGrid: {
    paddingHorizontal: 16,
  },
  badgeCard: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  badgeIconContainer: {
    marginRight: 16,
  },
  badgeIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadge: {
    backgroundColor: '#1f2937',
  },
  badgeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  lockedText: {
    opacity: 0.5,
  },
  bottomPadding: {
    height: 24,
  },
});
