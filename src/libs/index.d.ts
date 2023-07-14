export interface DecryptInfo {
    /**The encrypted string*/
    ciphertext: string
    /**The Key */
    key: string
    /**The iv */
    iv: string
    /**The auth_tag */
    tag: string
}
