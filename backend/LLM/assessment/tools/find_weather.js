export default async function findWeather({ user_prompt }) {
    // Example logic based on message — in reality, you'd fetch weather data
    if (user_prompt.toLowerCase().includes("weather")) {
        return "It's sunny and 25°C outside!";
    }
    return "I couldn't determine the weather based on the user's message.";
}
