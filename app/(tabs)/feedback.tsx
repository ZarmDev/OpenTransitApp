import React from 'react'
import { ThemedText } from '@/components/ThemedText';
import { Text, View, StyleSheet } from 'react-native';

export default function Feedback() {
    return (
      <View>
        <ThemedText>Submit feedback at https://github.com/ZarmDev/OpenTransitApp/issues</ThemedText>
      </View>
    );
  }