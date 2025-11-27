import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Coins,
  User,
  Gift,
  TrendingUp,
  Zap,
  Calendar,
  AlertCircle,
} from 'lucide-react-native';

const tokenHistory = [
  {
    id: 1,
    type: 'earned',
    amount: 15,
    description: 'Below threshold - Nov 27',
    date: '2025-11-27',
  },
  {
    id: 2,
    type: 'earned',
    amount: 18,
    description: 'Below threshold - Nov 26',
    date: '2025-11-26',
  },
  {
    id: 3,
    type: 'spent',
    amount: -50,
    description: 'EV Charging discount',
    date: '2025-11-25',
  },
  {
    id: 4,
    type: 'earned',
    amount: 12,
    description: 'Off-peak usage bonus',
    date: '2025-11-24',
  },
  {
    id: 5,
    type: 'transferred',
    amount: -30,
    description: 'Transferred to @sarah_m',
    date: '2025-11-23',
  },
  {
    id: 6,
    type: 'earned',
    amount: 20,
    description: 'Weekly streak bonus',
    date: '2025-11-22',
  },
];

const partnerOffers = [
  { id: 1, name: 'EV Charging', discount: '20% off', tokens: 100, icon: '⚡' },
  {
    id: 2,
    name: 'Smart Thermostat',
    discount: '$50 off',
    tokens: 500,
    icon: '🌡️',
  },
  {
    id: 3,
    name: 'Solar Panel Consultation',
    discount: 'Free assessment',
    tokens: 300,
    icon: '☀️',
  },
  { id: 4, name: 'Energy Audit', discount: '50% off', tokens: 150, icon: '📊' },
];

export default function TokenWalletScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'history' | 'offers'>('history');
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [offsetModalVisible, setOffsetModalVisible] = useState(false);

  const totalTokens = 1247;
  const tokenValue = (totalTokens * 0.05).toFixed(2);
  const penaltyAmount = 490;
  const penaltyCost = 24.5;
  const remainingTokens = totalTokens - penaltyAmount;

  const getIconForTransaction = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp color="#22c55e" size={20} />;
      case 'spent':
        return <Zap color="#ef4444" size={20} />;
      case 'transferred':
        return <User color="#ef4444" size={20} />;
      default:
        return <Coins color="#9ca3af" size={20} />;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Token Wallet</Text>
        <Text style={styles.subtitle}>Manage your energy rewards</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <LinearGradient
          colors={['#D0B100', '#FF6900']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.balanceCardContent}>
          <View style={styles.balanceHeader}>
            <View style={styles.coinIcon}>
              <Coins color="#ffffff" size={32} />
            </View>
            <View style={styles.tokenValueContainer}>
              <Text style={styles.tokenValueLabel}>Token Value</Text>
              <Text style={styles.tokenValueAmount}>${tokenValue}</Text>
            </View>
          </View>

          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{totalTokens}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setTransferModalVisible(true)}
            >
              <User color="#ffffff" size={16} />
              <Text style={styles.actionButtonText}>Transfer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setOffsetModalVisible(true)}
            >
              <Gift color="#ffffff" size={16} />
              <Text style={styles.actionButtonText}>Offset Bill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.activeTabText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offers' && styles.activeTab]}
          onPress={() => setActiveTab('offers')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'offers' && styles.activeTabText,
            ]}
          >
            Partner Offers
          </Text>
        </TouchableOpacity>
      </View>

      {/* History Tab */}
      {activeTab === 'history' && (
        <View style={styles.tabContent}>
          {tokenHistory.map(transaction => {
            const isPositive = transaction.amount > 0;
            return (
              <View key={transaction.id} style={styles.transactionCard}>
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: isPositive ? '#064e3b' : '#7f1d1d' },
                  ]}
                >
                  {getIconForTransaction(transaction.type)}
                </View>

                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <View style={styles.transactionDate}>
                    <Calendar color="#6b7280" size={12} />
                    <Text style={styles.transactionDateText}>
                      {transaction.date}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.transactionAmount,
                    { color: isPositive ? '#22c55e' : '#ef4444' },
                  ]}
                >
                  {isPositive ? '+' : ''}
                  {transaction.amount}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <View style={styles.tabContent}>
          {partnerOffers.map(offer => (
            <View key={offer.id} style={styles.offerCard}>
              <Text style={styles.offerIcon}>{offer.icon}</Text>
              <View style={styles.offerDetails}>
                <Text style={styles.offerName}>{offer.name}</Text>
                <Text style={styles.offerDiscount}>{offer.discount}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.offerButton,
                  totalTokens < offer.tokens && styles.offerButtonDisabled,
                ]}
                disabled={totalTokens < offer.tokens}
              >
                <Text
                  style={[
                    styles.offerButtonText,
                    totalTokens < offer.tokens &&
                      styles.offerButtonTextDisabled,
                  ]}
                >
                  {offer.tokens} tokens
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Transfer Modal */}
      <Modal
        visible={transferModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTransferModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Transfer Tokens</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Recipient Username</Text>
              <TextInput
                style={styles.input}
                placeholder="@username"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoLabel}>Your balance:</Text>
              <Text style={styles.modalInfoValue}>{totalTokens} tokens</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setTransferModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimary}>
                <Text style={styles.modalButtonPrimaryText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Offset Modal */}
      <Modal
        visible={offsetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOffsetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Offset Bill Penalty</Text>

            <View style={styles.warningBanner}>
              <View style={styles.warningContent}>
                <AlertCircle
                  color="#fca5a5"
                  size={20}
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningTitle}>
                    Current Penalty: ${penaltyCost.toFixed(2)}
                  </Text>
                  <Text style={styles.warningSubtitle}>
                    You exceeded your threshold this month
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tokens to Use</Text>
              <TextInput
                style={styles.input}
                value={String(penaltyAmount)}
                editable={false}
              />
              <Text style={styles.inputHelperText}>
                1 token = $0.10 bill reduction
              </Text>
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoLabel}>Your balance:</Text>
              <Text style={styles.modalInfoValue}>{totalTokens} tokens</Text>
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoLabel}>After offset:</Text>
              <Text style={styles.modalInfoValue}>
                {remainingTokens} tokens
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setOffsetModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, styles.orangeButton]}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  Confirm Offset ({penaltyAmount} tokens)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  balanceCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  balanceCardContent: {
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  coinIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenValueContainer: {
    alignItems: 'flex-end',
  },
  tokenValueLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tokenValueAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  transactionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionDateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  offerIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  offerDetails: {
    flex: 1,
  },
  offerName: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  offerDiscount: {
    fontSize: 14,
    color: '#22c55e',
  },
  offerButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  offerButtonDisabled: {
    backgroundColor: '#1f2937',
  },
  offerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  offerButtonTextDisabled: {
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  orangeButton: {
    backgroundColor: '#ea580c',
  },
  warningBanner: {
    backgroundColor: 'rgba(127, 29, 29, 0.5)',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningContent: {
    flexDirection: 'row',
    gap: 12,
  },
  warningTitle: {
    fontSize: 16,
    color: '#fca5a5',
    fontWeight: '600',
    marginBottom: 4,
  },
  warningSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  inputHelperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  bottomPadding: {
    height: 24,
  },
});
