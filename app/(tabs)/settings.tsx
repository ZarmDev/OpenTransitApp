import React from 'react'
import { ThemedText } from '@/components/ThemedText';
import { Text, View, StyleSheet } from 'react-native';

export default function Settings() {
    return (
      <View>
        <ThemedText>Settings</ThemedText>
        <ThemedText>Licenses:</ThemedText>
      </View>
    );
  }