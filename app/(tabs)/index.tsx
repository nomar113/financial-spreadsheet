import axios from 'axios';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import * as scriptsToExtractDataByState from './../../invoices_scripts';

export default function App() {
  const [invoiceData, setInvoiceData] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  const { extractDataFromRJ, extractDataFromGO } = scriptsToExtractDataByState;
  const extractData = (invoiceData.includes('rj.gov.br') ? extractDataFromRJ : extractDataFromGO);
  const closeWebView = () => {
    setInvoiceData('');
  };
  return (
  <SafeAreaView style={styles.container}>
    {!invoiceData && 
      <CameraView
        style={styles.camera}
        onBarcodeScanned={(scanningResult: BarcodeScanningResult) => {
          setInvoiceData(scanningResult.data);
        }}
      >
      </CameraView>
    }
    {invoiceData && 
      <View style={styles.container}>
        <WebView
          style={styles.container}
          source={{uri: invoiceData}}
          injectedJavaScript={extractData}
          mixedContentMode="always"
          originWhitelist={['*']}
          onMessage={async (event) => {
              console.log(invoiceData);
              const purchase = JSON.parse(event.nativeEvent.data);
              purchase.invoiceURL = invoiceData;
              console.log('Mensagem recebida da WebView:', JSON.stringify(purchase, null, 2));
              axios.post(`${process.env.EXPO_PUBLIC_NOMAR_API_URL}/purchases`, purchase)
                .then(response => {
                  console.log('Response:', response.data);
                })
                .catch(error => {
                  console.error('Error:', error);
                });
              setInvoiceData('');
            }}
        >
        </WebView>
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
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  button: {
    flex: 0.12,
    alignSelf: 'center',
    alignItems: 'center',
  },
});
