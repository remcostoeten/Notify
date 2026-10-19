import { toastStyles } from '../styles'

export function StyleSheet({ nonce }: { nonce?: string }) {
    return <style data-ntf='' nonce={nonce} dangerouslySetInnerHTML={{ __html: toastStyles }} />
}
