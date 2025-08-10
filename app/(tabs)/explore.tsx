import { ThemedText } from '@/components/ThemedText';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, SectionList, StyleSheet, View } from 'react-native';

interface Purchase {
  date: string;
  purchases: {
    id: number;
    date: string;
    merchantName: string;
    total: string;
  }[];
}

export default function TabTwoScreen() {
  const [purchasesGroupByDate, setPurchasesGroupByDate] = useState<Purchase[]>([]);
  const fetchData = async () => {
    console.log(process.env.EXPO_PUBLIC_NOMAR_API_URL);
    try {
      const response = await axios.get<Purchase[]>(`${process.env.EXPO_PUBLIC_NOMAR_API_URL}/purchases`);
      console.log('Success fetching data');
      setPurchasesGroupByDate(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={purchasesGroupByDate.map((purchase) => ({ ...purchase, data: purchase.purchases }))}
        keyExtractor={(item, index) => item.id.toString() + index}
        renderSectionHeader={({ section: { date } }) => (
          <ThemedText style={styles.sectionHeader}>{`${format(date, 'EEEE', { locale: ptBR })}, ${format(date, "d 'de' MMMM", { locale: ptBR })}`}</ThemedText>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconColumn}>
                <View style={styles.iconCircle}>
                  <ThemedText style={styles.icon}>{item.merchantName.substring(0, 2)}</ThemedText>
                </View>
                <ThemedText style={styles.time}>{format(item.date, 'HH:mm:ss', { locale: ptBR })}</ThemedText>
              </View>
              <View style={styles.ThemedTextColumn}>
                <ThemedText style={styles.title}>{item.merchantName}</ThemedText>
                <ThemedText style={styles.subtitle}>{item.merchantName}</ThemedText>
              </View>
              <View style={styles.valueColumn}>
                <ThemedText style={styles.value}>{formatter.format(parseFloat(item.total))}</ThemedText>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconColumn: {
    alignItems: "center",
    marginRight: 12,
  },
  iconCircle: {
    backgroundColor: "#003366",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  icon: {
    fontSize: 18,
  },
  time: {
    fontSize: 12,
    color: "#aaa",
  },
  ThemedTextColumn: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 2,
  },
  valueColumn: {
    alignItems: "flex-end",
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});