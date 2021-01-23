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
                  className="w-full p-4 bg-gray-800 rounded"
                  key={repository.id}
                >
                  <h2 className="w-72 pb-1 mb-2 border-b-2 border-vu-red text-2xl truncate">
                    {repository.object.text.Name}
                  </h2>
                  <div className="h-16">
                    <p className="mb-4 overflow-hidden line-clamp-2">
                      {repository.object.text.Description}
                    </p>
                  </div>
                  <a
                    className="inline-flex h-14 py-1 px-3 mr-4 font-bold bg-blue-600 rounded-sm"
                    href={repository.url}
                  >
                    Repository
                  </a>
                  <a
                    className="inline-flex h-14 flex-col py-1 px-3 mr-4 bg-blue-600 rounded-sm"
                    href={repository.downloadMeta.url}
                  >
                    <span className="font-bold">Download</span>
                    <span className="text-gray-300">{repository.downloadMeta.target}</span>
                  </a>
                </li>
              ))
          }
        </ul>
      </main>
      <footer className="p-4 mx-auto text-center">
        Unofficial fan-made <a href="https://github.com/Siilwyn/vu-mods">open source</a> project.
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
              releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
                nodes {
                  tagName
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
          downloadMeta: getDownloadMeta(repository),
        }))
    )
    .then((repositories) => {
      return {
        props: { repositories },
        revalidate: 60 * 60 * 24,
      };
    });
}

function getDownloadMeta(repository) {
  const target = repository.releases.nodes.length
    && repository.releases.nodes[0].tagName
    || 'master';

  return {
    target,
    url: `${repository.url}/archive/${target}.zip`,
  };
}
