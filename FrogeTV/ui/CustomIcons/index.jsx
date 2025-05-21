import { Ionicons } from '@expo/vector-icons';

export default function Icon({ icon = 'md-add', size = 24, color = 'white'}) {
    return (
        <Ionicons name={icon} size={size} color={color} />
    );
}