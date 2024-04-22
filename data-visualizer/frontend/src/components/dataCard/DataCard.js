import TextCard from "./TextCard";
import ImgCard from "./ImgCard";
import VidCard from "./VidCard";
import MiniTextCard from "./MiniTextCard";

const DataCard = ({ category, metadata, onClick }) => {
  switch (category) {
    case "messages":
    case "links":
      return <TextCard metadata={metadata} onClick={onClick} display={"uniqueChats"} />;
    case "images":
      return <ImgCard metadata={metadata} onClick={onClick} display={"uniqueChats"} />;
    case "videos":
      return <VidCard metadata={metadata} onClick={onClick} display={"uniqueChats"} />;
  }
  switch (metadata.contentType) {
    case "message":
    case "link":
      return <MiniTextCard metadata={metadata} onClick={onClick} display={"forwarded"}/>;
    case "image":
      return <ImgCard metadata={metadata} onClick={onClick} display={"forwarded"}/>;
    case "video":
      return <VidCard metadata={metadata} onClick={onClick} display={"forwarded"}/>;
  }
};

export default DataCard;
