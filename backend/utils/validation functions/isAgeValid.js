function isAgeValid(age, MAX_AGE, MIN_AGE){

    if (!age) {
        return {success: false, message: "age can't be empty"}

    } else if(age < MIN_AGE || age > MAX_AGE){
        return {success: false, message: "age must be between 5-120"}
    
    } else {
        return {success: true, message: ""}
    }

}

export default isAgeValid 