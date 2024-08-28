import React, {useEffect, useState} from 'react'
import { ThemedText } from '@/components/ThemedText';
import { Text, View, StyleSheet } from 'react-native';
import * as tH from '../tH'

export default function ServiceAlerts() {
    const [serviceAlerts, setServiceAlerts] = useState<JSX.Element[]>([]);

    async function getAlerts() {
        const alerts = await tH.getTrainServiceAlerts(false)
        const trainLines = Object.keys(alerts) 
        const text = Object.values(alerts)
        // Help from AI
        const result: JSX.Element[] = [];
        for (var i = 0; i < trainLines.length; i++) {
            if (text[i]["headerText"]) {
                result.push(<h3 key={`header-${i}`}>{text[i]["headerText"]}</h3>);
            }
            result.push(<p key={`line-${i}`}>{text[i]["descriptionText"]}</p>);
        }
        setServiceAlerts(result)
    }

    useEffect(() => {
        getAlerts()
    })
    return (
      <View>
        <ThemedText>Service Alerts</ThemedText>
        {serviceAlerts}
      </View>
    );
  }