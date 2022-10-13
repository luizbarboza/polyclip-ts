export default <T>(x: T) => {
    return () => {
        return x
    }
}