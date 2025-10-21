import Post from "./post";

export default function ProfilePosts({ username  }: { username: string }) {
    const posts = [
        {
            id: "1",
            community: "Jogos Vorazes",
            author: username,
            content: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. \n\nLorem Ipsum is simply dummy text of the printing and typesetting industry.`,
            commentsCount: 5,
            likesCount: 10
        },
        {
            id: "2",
            community: "O Gato Crítico",
            author: username,
            content: `MIAU MIAU MIAU meow meow mi mi mi aaaaaau miau mmmeoooow miau rawn RAWN RAWN RAWWWWWWWNNNNNN RAWN rawrrrnn RAWRN... MIAU MIAU MIAU meow meow mi mi mi aaaaaau miau mmmeoooow miau rawn RAWN RAWN RAWWWWWWWNNNNNN RAWN rawrrrnn RAWRN...MIAU MIAU MIAU meow meow mi mi mi aaaaaau miau mmmeoooow miau rawn RAWN RAWN RAWWWWWWWNNNNNN RAWN rawrrrnn RAWRN... MIAU MIAU MIAU meow meow mi mi mi aaaaaau miau mmmeoooow miau rawn RAWN RAWN RAWWWWWWWNNNNNN RAWN rawrrrnn RAWRN...`,
            commentsCount: 5,
            likesCount: 10
        }
    ];
    return (
        <div className="w-full grid grid-cols-1 gap-4 relative">
            {posts.map(post => (
                <Post 
                    key={post.id} 
                    id={post.id} 
                    community={post.community} 
                    author={post.author} 
                    content={post.content} 
                    commentsCount={post.commentsCount} 
                    likesCount={post.likesCount} />
            ))}
        </div>
    )
}
