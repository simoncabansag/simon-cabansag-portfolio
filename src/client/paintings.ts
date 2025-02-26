// count 9
export const intersects = [
    "Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party",
    "The_City_Rises_by_Umberto_Boccioni_1910001",
    "Caspar_David_Friedrich_-_Wanderer_above_the_Sea_of_Fog",
    "Tableau_I,_by_Piet_Mondriaan001",
    "Johannes_Vermeer_-_The_Astronomer_-_1668",
    "Convergence-Jackson-Pollock002",
    "Water_From_A_Running_Tap_Francis_Bacon001",
    "Escher's_Relativity",
    "Kenilworth-Castle-JMW001",
]

// count 9
export const overlays = [
    "socials",
    "work",
    "yt",
    "kingdomagape",
    "gamma",
    "graphics",
    "fundtap",
    "languages",
    "udk",
]

export const mapping: Record<string, string> = intersects.reduce(
    (acc, key, index) => {
        acc[key] = overlays[index] ?? ""
        return acc
    },
    {} as Record<string, string>
)

// count 23
export const paintings = [
    "branches-with-almond-blossom-1890",
    "The-Builders-jacob-l",
    "Tsunami_by_hokusai_19th_century",
    "son-of-man-1964-magritte",
    "Caspar_David_Friedrich_-_Wanderer_above_the_Sea_of_Fog",
    "Le_Jugement_de_Salomon_-_1649_-_Nicolas_Poussin_-_Louvre",
    "Jean-François_Millet_-_Gleaners",
    "Mona_Lisa,_by_Leonardo_da_Vinci",
    "A_Sunday_on_La_Grande_Jatte,_Georges_Seurat,_1884",
    "Fighters_(texture)_JE1_BE1",
    "Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party",
    "Johannes_Vermeer_-_The_Astronomer_-_1668",
    "Escher's_Relativity",
    "La_Liberté_guidant_le_peuple_-_Eugène_Delacroix_-_Musée_d",
    "The_City_Rises_by_Umberto_Boccioni_1910001",
    "Water_From_A_Running_Tap_Francis_Bacon001",
    "Kenilworth-Castle-JMW001",
    "Monet_-_Impression,_Sunrise001",
    "Sir_Frank_Dicksee_-_The_Two_Crowns001",
    "Les_Joueurs_de_cartes,_par_Paul_Cézanne,_Metropolitan_Mus",
    "Tableau_I,_by_Piet_Mondriaan001",
    "Convergence-Jackson-Pollock002",
    "BuenPastorMurillo1660001",
]
