import facebookIcon from "@/assets/icons/facebookIcon.png";
import twitterIcon from "@/assets/icons/twitterIcon.png"
import editIcon from '@/assets/icons/editIcon.png'
import binIcon from '@/assets/icons/binIcon.png'
import plusIcon from '@/assets/icons/plusIcon.png'
import folderIcon from '@/assets/icons/folderIcon.png'
import notebookIcon from '@/assets/icons/notebookIcon1.png'
import HomeIcon from "@/assets/icons/home.png"
import ProfileIcon from "@/assets/icons/profile.png"
import AdaptiveIcon from "@/assets/images/adaptive-icon.png"
import splashImage from "@/assets/images/splash.png"
import BackArrow from "@/assets/images/go_back_icon.png"
import splashVideo from "@/assets/videos/splash-video.mp4"



const LoginInputFieldsObject = [
    {lableName: "email", placeHolder: "example@gmail.com"},
    {lableName: "password", placeHolder: "*******"}
]

const RegisterInputFieldsObject = [
    {lableName: "name", placeHolder: "example123"},
    {lableName: "email", placeHolder: "example@gmail.com"},
    {lableName: "password", placeHolder: "*******"},
    {lableName: "confirm password", placeHolder: "*******"}
]

const resetPasswordFiledObject = 
    {lableName: "email", placeHolder: "example@gmail.com"}

const icons = {
    facebookIcon,
    twitterIcon,
    AdaptiveIcon,
    BackArrow,
    HomeIcon,
    ProfileIcon,
    editIcon,
    folderIcon,
    notebookIcon,
    binIcon,
    plusIcon
};

const images = {
    splashImage
}

const videos = {
    splashVideo
}

export {LoginInputFieldsObject, RegisterInputFieldsObject, resetPasswordFiledObject, icons, images, videos};