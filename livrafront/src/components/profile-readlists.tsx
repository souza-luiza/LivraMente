import { image } from "framer-motion/client";
import Readlist from "./readlist";

export default function ProfileReadlists() {
    const readlists = [
        {
            id: "1",
            title: "Minha lista de fantasia",
            author: "usuario123",
            imageUrl: ""
        },
        {
            id: "2",
            title: "Livros de ficção científica",
            author: "usuario456",
            imageUrl: ""
        },
        {
            id: "3",
            title: "Romances clássicos",
            author: "usuario789",
            imageUrl: ""
        },
        {
            id: "4",
            title: "Thrillers emocionantes",
            author: "usuario101",
            imageUrl: ""
        },
        {
            id: "5",
            title: "Histórias de mistério",
            author: "usuario202",
            imageUrl: ""
        },
        {
            id: "6",
            title: "Livros de não-ficção",
            author: "usuario303",
            imageUrl: ""
        },
        {
            id: "7",
            title: "Contos de horror",
            author: "usuario404",
            imageUrl: ""
        },
        {
            id: "8",
            title: "Aventuras épicas",
            author: "usuario505",
            imageUrl: ""
        }
    ];
    return (
        <div className="w-full h-fit grid grid-cols-4 gap-2 relative">
            {readlists.map((readlist) => (
                <Readlist 
                    key={readlist.id} 
                    id={readlist.id}
                    title={readlist.title} 
                    author={readlist.author} 
                    image={readlist.imageUrl} />
            ))}
        </div>
    )
}