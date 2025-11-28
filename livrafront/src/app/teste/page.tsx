"use client";

import AddBook from "@/components/add-book";
import AddReadlist from "@/components/add-readlist";

export default function PageTest() {
    return (
        <AddReadlist
            isOpen={true}
            onClose={() => console.log("Fechou")}
            onSave={() => console.log("Livro salvo:")}
        />
    );
}