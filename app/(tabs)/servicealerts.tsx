import React, { useEffect, useState } from 'react'
import { ThemedText } from '@/components/ThemedText';
import { Text, View, StyleSheet } from 'react-native';
import * as tH from '../tH'

export default function ServiceAlerts() {
  const [serviceAlerts, setServiceAlerts] = useState<JSX.Element[]>([]);

  async function getAlerts() {
    const alerts = await tH.getTrainServiceAlerts(false, false)
    const trainLines = Object.keys(alerts)
    const text = Object.values(alerts)
    // Help from AI
    const result: JSX.Element[] = [];
    for (var i = 0; i < trainLines.length; i++) {
      if (text[i]["headerText"]) {
        result.push(<ThemedText key={`header-${i}`} style={styles.header}>{text[i]["headerText"]}</ThemedText>);
      }
      if (text[i]["descriptionText"]) {
        result.push(<ThemedText key={`line-${i}`} style={styles.bold}>{text[i]["descriptionText"]}</ThemedText>);
      }
    }
    setServiceAlerts(result)
  }

  useEffect(() => {
    getAlerts()
  })
  return (
    <View>
      <ThemedText style={styles.title}>Service Alerts</ThemedText>
      {serviceAlerts}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24
  },
  header: {
      fontSize: 16,
      // fontWeight: 'bold',
  },
  bold: {
     
  },
});