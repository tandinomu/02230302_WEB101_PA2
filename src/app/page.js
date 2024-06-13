"use client";
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import useStore from '../store/store'; // Importing the useStore hook

const Pokedex = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [error, setError] = useState(null);
  const { caughtPokemons, addCaughtPokemon, removeCaughtPokemon, clearCaughtPokemons } = useStore();
  const [showCaughtPokemons, setShowCaughtPokemons] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPokemonList = async () => {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${(page - 1) * 20}`);
        if (response.ok) {
          const data = await response.json();
          setTotalPages(Math.ceil(data.count / 20));
          const pokemonDetails = await Promise.all(data.results.map(async (pokemon) => {
            const response = await fetch(pokemon.url);
            if (response.ok) {
              return await response.json();
            } else {
              throw new Error(`Failed to fetch details for ${pokemon.name}`);
            }
          }));
          setPokemonList(pokemonDetails);
          setError(null);
        } else {
          console.error("Failed to fetch Pokémon list:", response.status);
          setError("Failed to fetch Pokémon list");
        }
      } catch (error) {
        console.error("Error fetching Pokémon list:", error);
        setError("Error fetching Pokémon list");
      }
    };

    fetchPokemonList();
  }, [page]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedPokemon(data);
        setError(null);
      } else {
        console.error("Failed to fetch Pokémon data:", response.status);
        setSelectedPokemon(null);
        setError("Failed to fetch Pokémon data");
      }
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
      setSelectedPokemon(null);
      setError("Error fetching Pokémon data");
    }
  };

  const handlePokemonCardClick = async (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handleCaughtClick = (pokemon) => {
    if (!selectedPokemon) {
      // If selectedPokemon is null, it means we are on the homepage
      if (!caughtPokemons.includes(pokemon.name)) {
        addCaughtPokemon(pokemon.name);
      }
    } else {
      // If selectedPokemon is not null, it means we are in the details page
      if (!caughtPokemons.includes(selectedPokemon.name)) {
        addCaughtPokemon(selectedPokemon.name);
      }
    }
  };

  const handleRelease = (pokemonName) => {
    removeCaughtPokemon(pokemonName);
    // If the released Pokemon is the currently selected Pokemon, reset selectedPokemon to null
    if (selectedPokemon && selectedPokemon.name === pokemonName) {
      setSelectedPokemon(null);
    }
  };
  

  const handleShowCaughtPokemons = () => {
    setShowCaughtPokemons(true);
  };

  const handleBackToHome = () => {
    setSelectedPokemon(null);
    setShowCaughtPokemons(false);
  };

  const handleBackFromCaughtPokemons = () => {
    setShowCaughtPokemons(false);
  };

  return (
    <div className="font-Arial sans-serif text-center max-w-800 mx-auto px-10 py-10">
      <h1 className="mb-10 text-orange-600 uppercase font-bold text-4xl">Pokedex</h1>
      <div className="mb-10 flex justify-center">
        <div className="flex">
          <Input
            type="text"
            placeholder="Search Pokémon"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 mr-2 rounded border border-gray-400 text-base"
          />
          <Button onClick={handleSearch} variant="primary" className="mr-2" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', border: '1px solid #ccc' }}>Search</Button>
          <Button onClick={handleShowCaughtPokemons} variant="primary" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', border: '1px solid #ccc' }}>Caught Pokémon</Button>
        </div>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {showCaughtPokemons ? (
        <div>
          <h2>Caught Pokémon:</h2>
          <div className="flex flex-wrap justify-center">
            {caughtPokemons.map((pokemonName, index) => {
              const pokemon = pokemonList.find(p => p.name === pokemonName);
              return (
                <div key={index} className="m-2 text-center border border-gray-300 rounded-lg p-4" style={{ width: '16.666%' }}>
                  {pokemon && (
                    <>
                      <img
                        src={pokemon.sprites.front_default}
                        alt={pokemonName}
                        className="w-100 rounded-lg shadow-md mb-2 mx-auto"
                      />
                      <p className="capitalize text-lg font-bold text-gray-700">{pokemonName}</p>
                      <Button onClick={() => handleRelease(pokemonName)} variant="primary" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', border: '1px solid #ccc' }}>Release</Button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <Button onClick={handleBackFromCaughtPokemons} variant="primary" className="mt-4" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', border: '1px solid #ccc' }}>Back</Button>
        </div>
      ) : selectedPokemon ? (
        <div className="mb-10">
          <h2 className="text-red-600 capitalize">{selectedPokemon.name}</h2>
          <div className="border border-gray-300 rounded-lg p-4">
            {selectedPokemon.sprites && (
              <img src={selectedPokemon.sprites.front_default} alt={selectedPokemon.name} className="w-100 rounded-lg shadow-md mb-5 mx-auto" />
            )}
            <p><strong>Type:</strong> {selectedPokemon.types.map((type) => type.type.name).join(', ')}</p>
            <p><strong>Abilities:</strong> {selectedPokemon.abilities.map((ability) => ability.ability.name).join(', ')}</p>
            <p><strong>Stats:</strong></p>
            <div className="flex justify-center">
              <ul className="list-none p-0 text-left">
                {selectedPokemon.stats.map((stat, index) => (
                  <li key={index}><strong>{stat.stat.name}:</strong> {stat.base_stat}</li>
                ))}
              </ul>
            </div>
            <Button onClick={() => handleCaughtClick(selectedPokemon)} variant="primary" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', border: '1px solid #ccc' }}>Catch</Button>{' '}
            <Button onClick={handleBackToHome} variant="primary" className="mt-4" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', border: '1px solid #ccc' }}>Back</Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap justify-center">
            {pokemonList.map((pokemon, index) => (
              <div key={index} className="m-2 text-center cursor-pointer border border-gray-300 rounded-lg p-4" onClick={() => handlePokemonCardClick(pokemon)} style={{ width: '16.666%' }}>
                <img
                  src={pokemon.sprites.front_default}
                  alt={pokemon.name}
                  className="w-100 rounded-lg shadow-md mb-2 mx-auto"
                />
                <p className="capitalize text-lg font-bold text-gray-700">{pokemon.name}</p>
                <Button onClick={() => handleCaughtClick(pokemon)} variant="primary" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', border: '1px solid #ccc' }}>Catch</Button>
              </div>
            ))}
          </div>
        </div>
      )}
      <Pagination className="flex justify-center mt-4">
        <PaginationContent>
          <PaginationPrevious onClick={() => setPage(page - 1)} disabled={page === 1} />
          {page > 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
          {page > 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => setPage(page - 1)}>{page - 1}</PaginationLink>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationLink isActive>{page}</PaginationLink>
          </PaginationItem>
          {page < totalPages && (
            <PaginationItem>
              <PaginationLink onClick={() => setPage(page + 1)}>{page + 1}</PaginationLink>
            </PaginationItem>
          )}
          {page < totalPages - 1 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
          <PaginationNext onClick={() => setPage(page + 1)} disabled={page === totalPages} />
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Pokedex;
