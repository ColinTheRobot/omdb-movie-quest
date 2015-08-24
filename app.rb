# At the top of our app.rb file we need to include the gems we'll be using
# within this app. 
#
# Sinatra needs to be required so that we have access to the Sinatra DSL
require 'sinatra'
require 'sinatra/contrib'

# We're using the HTTParty gem to make GET requests to the OMDB API
require 'httparty'


# This is a simple introdocution to Sinatra's DSL (Domain Specific Language)
# `get` specifies the type of request. (See http://www.restapitutorial.com/lessons/httpmethods.html )
# the `/` is defining the route. So when we hit the root off our app. 
# Or what we often refer to as the home page the code within the block signified 
# by do end will run
# In this app I'm using the erb template to render my html so that I can easily
# access ruby within the file. the command erb tells our code to look for an erb file
# with the name index.
get '/' do
  erb :index
end

get '/get-movies' do
  # The first use of HTTparty and the OMDB API
  # `.get` is a method within the HTTParty gem. 
  # We're passing it a single argument and string interpolating within the url
  # to provide a paramater that comes from the view

  # the response from the api will be assigned to the variable data
  data = HTTParty.get("http://www.omdbapi.com/?s=#{params["movie-title"]}")

  # finally we're going to explicitly return the data as json
  return data.to_json
end

get '/expand' do
  data = HTTParty.get("http://www.omdbapi.com/?i=#{params["id"]}")

  # Here we're just deleting some extra parameters from the response to keep
  # our view from getting too cluttered
  data.delete("Poster")
  data.delete("imdbVotes")
  data.delete("Type")
  data.delete("Response")

  return data.to_json
end

get '/favorites' do
  @favorites = JSON.parse(File.read('data.json'))

  erb :favorites
end

post '/favorite' do
  unless params[:name] && params[:title] && params[:oid]
    return 'Invalid Request'
  end


  favorite = { name: params[:name], title: params[:title], oid: params[:oid] }

  # Since we haven't set up a database in our application we're just going to
  # write to our users Favorites to a file. This is easier said than done, 
  # because we'd like this data to persist and the data needs to be serialized 
  # in a way that are view will always be able to recognize it as json.

  # I've already set up are file so that it's initual structure is valid json
  # In the following line we're going to use Ruby's File module to read our pseudo
  # database. And then use the JSON module to to parse the json structure within.
  json = JSON.parse(File.read('data.json'))

  # Above we saved the files json structure in it's entirety to the variable json
  # this way we can open our file, shovel ( << alias for .push ) our new favorite
  # into the existing structure and rewrite the file with this updated object.
  File.open('data.json', "w") do |f|
    json["favorites"] << favorite
    f.write(JSON.pretty_generate(json))
  end
end
