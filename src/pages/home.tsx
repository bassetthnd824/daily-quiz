const HomeComponent = () => {
  const username = localStorage.getItem('username')

  return (
      <>
        <h1>Daily Quiz</h1>
        <h2>Welcome {username}</h2>
      </>
  )
}

export default HomeComponent