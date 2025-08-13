import { ThemedText } from '@/components/ThemedText';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, RefreshControl, SafeAreaView, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';

interface Purchase {
  date: string;
  purchases: {
    id: number;
    date: string;
    merchantName: string;
    total: string;
    invoiceURL: string;
  }[];
}

export default function TabTwoScreen() {
  const [purchasesGroupByDate, setPurchasesGroupByDate] = useState<Purchase[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [webViewURL, setWebViewURL] = useState(``)
  const fetchData = async () => {
    console.log(process.env.EXPO_PUBLIC_NOMAR_API_URL);
    try {
      const response = await axios.get<Purchase[]>(`${process.env.EXPO_PUBLIC_NOMAR_API_URL}/purchases`);
      console.log('Success fetching data');
      setPurchasesGroupByDate(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const closeWebView = () => {
    setWebViewURL('');
  };
  return (
    <SafeAreaView style={styles.container}>
      {!webViewURL && 
        <SectionList
          sections={purchasesGroupByDate.map((purchase) => ({ ...purchase, data: purchase.purchases }))}
          keyExtractor={(item, index) => item.id.toString() + index}
          renderSectionHeader={({ section: { date } }) => (
            <ThemedText style={styles.sectionHeader}>
              {`${format(new Date(`${date}T12:00`), 'EEEE', { locale: ptBR })}, ${format(new Date(`${date}T12:00`), "d 'de' MMMM", { locale: ptBR })}`}
              </ThemedText>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setWebViewURL(item.invoiceURL)}>
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
            </TouchableOpacity>
          )}
          stickySectionHeadersEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
        />
      }
      {webViewURL && 
        <View style={styles.container}>
          <WebView
            style={styles.container}
            source={{uri: webViewURL}}
          />
          <TouchableOpacity style={styles.button}>
            <Button title="Close WebView" onPress={closeWebView} />
          </TouchableOpacity>
        </View>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
  button: {
    flex: 0.12,
    alignSelf: 'center',
    alignItems: 'center',
  },
});