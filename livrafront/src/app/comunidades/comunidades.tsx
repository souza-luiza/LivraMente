import Comunidade from "@/components/comunidade"

const comunidades = [
    {
        id: "1",
        name: "Jogos Vorazes",
        descricao: "Na região antigamente conhecida como América do Norte, a Capital de Panem controla 12 distritos e os força a escolher um garoto e uma garota, conhecidos como tributos, para competir em um evento anual televisionado. Todos os cidadãos assistem aos temidos jogos, no qual os jovens lutam até a morte, de modo que apenas um saia vitorioso. A jovem Katniss Everdeen, do Distrito 12, confia na habilidade de caça e na destreza com o arco, além dos instintos aguçados, nesta competição mortal.",
        imageUrl: "",
        generos: ["distopia", "aventura"]
    },
    {
        id: "2",
        name: "The Summer I Turned Pretty",
        descricao: "História de Belly Conklin, uma adolescente que vive o auge do ano durante as férias de verão na praia de Cousins. A trama foca no triângulo amoroso entre Belly e os irmãos Jeremiah e Conrad Fisher, na forte amizade entre as mães, e na jornada de Belly para a vida adulta",
        imageUrl: "",
        generos: ["romance", "drama"]
    },
    {
        id: "3",
        name: "Percy Jackson",
        descricao: "O adolescente Percy Jackson descobre que os deuses gregos e as criaturas mitológicas são reais. Ele é filho de uma divindade e logo entra para um acampamento de treinamento para semideuses. Enquanto tenta se adaptar a seus novos poderes e amigos, ele descobre que o Raio-Mestre do poderoso Zeus foi roubado e ele é o principal suspeito. Assim, ele tenta solucionar o mistério junto com seus novos colegas, Grover e Annabeth.",
        imageUrl: "",
        generos: ["fantasia", "aventura", "drama"]
    },
    {
        id: "4",
        name: "A Seleção",
        descricao: "Para trinta e cinco garotas, a Seleção é a chance de uma vida. É a oportunidade de ser alçada a um mundo de vestidos deslumbrantes e joias valiosas. De morar em um palácio, conquistar o coração do belo príncipe Maxon e um dia ser a rainha. America Singer, no entanto, estar entre as Selecionadas é um pesadelo. Significa deixar para trás o rapaz que ama. Abandonar sua família e seu lar para entrar em uma disputa ferrenha por uma coroa que ela não quer. E viver em um palácio sob a ameaça constante de ataques rebeldes.",
        imageUrl: "",
        generos: ["romance", "drama"]
    },
    {
        id: "5",
        name: "ACOTAR",
        descricao: "Feyre, filha de um casal de mercadores humanos e falidos, se torna caçadora para sustentar a família. Dura como as flechas que carrega, letal como sua pontaria",
        imageUrl: "",
        generos: ["fantasia", "romance"]
    },
    {
        id: "6",
        name: "Estilhaça-me",
        descricao: "Depois de passar toda a vida privada de liberdade, ela finalmente está encontrando forças para lutar e para viver um futuro com o garoto que pensava ter perdido",
        imageUrl: "",
        generos: ["distopia", "romance"]
    },
]

interface ComunidadesProps { 
  genero?: string; // gênero a filtrar
} 

export default function Comunidades({ genero }: ComunidadesProps) { 
    const filteredComunidades = genero ? comunidades.filter((c) => c.generos.includes(genero)) : comunidades;

    return (
        <div className="w-full h-fit grid grid-cols-3">
            {filteredComunidades.map((comunidade) => (
                <Comunidade
                    key={comunidade.id}
                    id={comunidade.id}
                    name={comunidade.name}
                    descricao={comunidade.descricao}
                    image={comunidade.imageUrl}
                />
            ))}
        </div>
    )
}