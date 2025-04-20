import { View, Text, Image, Button } from "react-native";

export default function ConnectionPreview({ userId, status, direction, profile, handleApproveConnection, handleDenyConnection }) {
    return (
        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: "row", width: "100%",}}>
            <Image source={{uri: profile.profilePicRef}} width={50} height={50}></Image>
            <Text style={styles.profileSubtext}>{profile.username}</Text>
            <Text style={styles.profileSubtext}>{profile.firstName + " " + profile.lastName}</Text>
            { status == "requested" && direction == "incoming" ? 
            <View style={{display: 'flex', alignItems: 'center', flexDirection: "column",}}>
                <Button
                    title="Approve"
                    onPress={handleApproveConnection}
                />
                <Button
                    title="Deny"
                    onPress={handleDenyConnection}
                />
            </View>
             : undefined
             }
        </View>
    );
}
