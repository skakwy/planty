import React, { useEffect, useState } from 'react';
import { View, Keyboard, LayoutAnimation, Platform } from 'react-native';

const KeyboardAwareView = ({ children, useMarginTop,margin=100 }) => {
  const [keyboardShown, setKeyboardShown] = useState(false);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardShown(true);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardShown(false);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        ...(useMarginTop ? { marginTop: keyboardShown ? -margin : 0 } : { marginBottom: keyboardShown ? margin : 0 }),
      
      }}
    >
      {children}
    </View>
  );
};

export default KeyboardAwareView;
