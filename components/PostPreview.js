import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, TouchableOpacity, Text } from 'react-native';

export default function PostPreview({ questionOfTheDay, description, thumbnailSrc, onPress}) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.postPreview}
      >
        <Image
          source={{uri: thumbnailSrc}}
          style={styles.postPreviewImage}
          resizeMode='contain'
        />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,.3)', 'rgba(0,0,0,0.3)']} locations={[0,0.3,1]} style={[styles.postPreviewGradient]}>
          <Text numberOfLines={2} style={styles.postPreviewQuestion}>{questionOfTheDay}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }