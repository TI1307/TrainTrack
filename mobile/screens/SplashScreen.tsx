import {View , Image , StyleSheet } from "react-native"
export default function SplashScreen (){
    return(
    <View style={styles.container}>
        <Image 
        source={require ("../assets/trainlogo.png")}
        style ={styles.logo}
        >
        </Image>
       
    </View>
    );
}
    const styles =StyleSheet.create({
        container:{
            flex :1,
            justifyContent:"center" ,
            alignItems:"center",
            backgroundColor: "#0B3D6B",
        },
        logo:{
            height:180,
            width:180,
            resizeMode: "contain",

        },
    }
    );
  