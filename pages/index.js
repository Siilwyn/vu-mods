import Head from 'next/head';
import { useState } from 'react';
import ky from 'ky-universal';

export default function IndexPage({ repositories }) {
  const [searchInput, setSearchInput] = useState('');

  return (
    <div className="min-h-screen p-6 bg-vu-gray text-white">
      <Head>
        <title>VU Mods Listing</title>
        <link rel="icon" href="/favicon.svg"></link>
      </Head>
      <header className="flex flex-col items-center mb-8">
        <img
          className="mb-2 mr-3"
          src="/logo-venice-unleashed.svg"
          width="85"
          alt="VU"
        />
        <h1 className="text-4xl font-bold mb-6">Mods Listing</h1>
      </header>
      <main className="mb-8">
        <input
          className="block px-4 py-3 mx-auto mb-6 bg-gray-700 rounded"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-controls="modList"
          autoFocus
        />
        <ul
          className="grid gap-6 justify-center"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 32rem))',
          }}
          id="modList"
          aria-live="polite"
        >
          {
            repositories
              .filter((repository) =>
                repository.object.text.Name.toLowerCase().includes(
                  searchInput.toLowerCase()
                )
              )
              .map((repository) => (
                <li
                  className="w-full h-48 p-4 bg-gray-800 rounded"
                  key={repository.id}
                >
                  <div className="flex w-72 pb-1 mb-2 truncate border-b-2 border-vu-red">
                    <h2 className="text-2xl mr-1">
                      {repository.object.text.Name}
                    </h2>
                    &nbsp;
                    <span className="text-gray-400">
                      v{repository.object.text.Version}
                    </span>
                  </div>
                  <div className="h-16">
                    <p className="mb-4 overflow-hidden line-clamp-2">
                      {repository.object.text.Description}
                    </p>
                  </div>
                  <a
                    className="py-1 px-2 mr-4 bg-blue-600 rounded-sm font-bold"
                    href={repository.url}
                  >
                    Repository
                  </a>
                  <a
                    className="py-1 px-2 mr-4 bg-blue-600 rounded-sm"
                    href={`${repository.url}/archive/master.zip`}
                  >
                    Download
                  </a>
                </li>
              ))
          }
        </ul>
      </main>
      <footer className="p-4 mx-auto text-center">
        Unofficial fan-made project.
        <br />
        Check the official
        <a className="text-vu-red" href="https://veniceunleashed.net/">
          &nbsp;Venice Unleashed website
        </a>
        &nbsp;for more information.
      </footer>
    </div>
  );
}

export function getStaticProps() {
  return ky('https://api.github.com/graphql', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
    },
    json: {
      query: `{
        search(query: "topic:venice-unleashed", type: REPOSITORY, first: 100) {
          nodes {
            ... on Repository {
              id
              url
              object(expression: "master:mod.json") {
                ... on Blob {
                  text
                }
              }
            }
          }
        }
      }`,
    },
  })
    .json()
    .then(({ data }) =>
      data.search.nodes
        .filter((repository) => repository.object)
        .map((repository) => ({
          ...repository,
          object: { text: JSON.parse(repository.object.text) },
        }))
    )
    .then((repositories) => {
      return {
        props: { repositories },
        revalidate: 60 * 60 * 24,
      };
    });
}
