import { createRestLink } from '../rest-link'
import { execute, makePromise } from 'apollo-link'
import gql from 'graphql-tag'
import fetchMock from 'fetch-mock'

describe('Query', () => {
  afterEach(() => {
    fetchMock.restore()
  })

  it('can get an user by id', async () => {
    expect.assertions(1)

    fetchMock.get('/users/1', {
      id: '1',
      login: 'Peter',
    })

    const userProfileQuery = gql`
      query userProfile {
        userProfile(id: "1")
          @rest(type: "User", route: "/users/:id", params: { id: "1" }) {
          id
          login
        }
      }
    `

    const link = createRestLink()

    const data = await makePromise(
      execute(link, {
        operationName: 'userProfile',
        query: userProfileQuery,
      }),
    )

    expect(data).toEqual({
      userProfile: {
        __typename: 'User',
        id: '1',
        login: 'Peter',
      },
    })
  })

  it('can get an user by id based on variable', async () => {
    expect.assertions(1)

    fetchMock.get('/users/2', {
      id: '2',
      login: 'Jochen',
    })

    const userProfileQuery = gql`
      query userProfile($id: ID!) {
        userProfile(id: $id)
          @rest(type: "User", route: "/users/:id", params: { id: $id }) {
          id
          login
        }
      }
    `

    const link = createRestLink()

    const data = await makePromise(
      execute(link, {
        operationName: 'userProfile',
        query: userProfileQuery,
        variables: { id: '2' },
      }),
    )

    expect(data).toEqual({
      userProfile: {
        __typename: 'User',
        id: '2',
        login: 'Jochen',
      },
    })
  })

  it('throws if a variable user as a param is missing', async () => {
    expect.assertions(1)

    const userProfileQuery = gql`
      query userProfile($id: ID!) {
        userProfile(id: $id)
          @rest(type: "User", route: "/users/:id", params: { id: $id }) {
          id
          login
        }
      }
    `

    const link = createRestLink()

    return makePromise(
      execute(link, {
        operationName: 'userProfile',
        query: userProfileQuery,
      }),
    ).catch(err => {
      expect(err.message).toEqual("Missing variable 'id'")
    })
  })

  it('can load relations with the provider arguments', async () => {
    expect.assertions(1)

    fetchMock.get('/users/2', {
      id: '2',
      login: 'Jochen',
    })

    fetchMock.get('/users/2/friends', [
      {
        id: '1',
        login: 'Peter',
      },
      {
        id: '3',
        login: 'Joachim',
      },
    ])

    const userProfileQuery = gql`
      query userProfile($id: ID!) {
        userProfile(id: $id)
          @rest(type: "User", route: "/users/:id", params: { id: $id }) {
          id
          login
          friends
            @rest(
              type: "User"
              route: "/users/:userId/friends"
              provides: { userId: "id" }
            ) {
            id
            login
          }
        }
      }
    `

    const link = createRestLink()

    const data = await makePromise(
      execute(link, {
        operationName: 'userProfile',
        query: userProfileQuery,
        variables: { id: 2 },
      }),
    )

    expect(data).toEqual({
      userProfile: {
        __typename: 'User',
        id: '2',
        login: 'Jochen',
        friends: [
          {
            __typename: 'User',
            id: '1',
            login: 'Peter',
          },
          {
            __typename: 'User',
            id: '3',
            login: 'Joachim',
          },
        ],
      },
    })
  })
})
