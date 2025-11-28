"use client";

import AddBook from "@/components/add-book";

export default function PageTest() {
    return (
        <AddBook
            isOpen={true}
            onClose={() => console.log("Fechou")}
            onSave={() => console.log("Livro salvo:")}
        />
    );
}