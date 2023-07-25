import { TextInput,StyleSheet } from "react-native"
const DefaultTextInput = ({children, style, placeholder,onChangeText,autoComplete,value}) => {

    
    return  (
    
    <TextInput style={[styles.loginTextInput,style]} autoComplete={autoComplete} onChangeText={onChangeText} value={value} placeholderTextColor="#6A6A6A" placeholder={placeholder} />)
    
}
const styles = StyleSheet.create({
    loginTextInput: {
      color: "white",
      width: 300,
      borderBottomColor: "white",
      borderBottomWidth: 0.5,
      fontSize: 18,
      padding: 5,
      fontFamily: "Poppins_400Regular",
        
    }
    
})
export default DefaultTextInput;