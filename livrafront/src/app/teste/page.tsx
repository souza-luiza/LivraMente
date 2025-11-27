"use client";

import AddBookReadlist from "@/components/add-book-readlist";

export default function PageTest() {
    return (
        <AddBookReadlist
            tipo="book"
            isOpen={true}
            onClose={() => console.log("Fechou")}
            onSave={(livro) => console.log("Livro salvo:", livro)}
        />
    );
}