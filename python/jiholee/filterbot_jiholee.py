import discord # rewrite
from discord.ext import commands
import badworddata_handler as BWH


token = BWH.get_token()

prefix = "fb!"

bot = commands.Bot(prefix)

@bot.event
async def on_ready():
    await bot.change_presence(activity=discord.Activity(name="Filterbot 테스트중", type=1))
    print("Filterbot 작동!")


@bot.event
async def on_message(message):
    if bot.user.mentioned_in(message) and message.mention_everyone is False:
        await message.channel.send("욕설 감시중입니다.")
    await bot.process_commands(message)


@bot.command(name="filter")
async def __filter(message, *, bad_string):
    boolean = BWH.check(bad_string)
    if boolean:
        await message.channel.send("욕설이 감지되었습니다!")
    else:
        await message.channel.send("욕설이 감지되지 않았습니다!")


@bot.command()
async def show(message):
    wordlist = BWH.get()
    await message.channel.send(', '.join(wordlist))


@bot.command()
async def append(message, *, word):
    BWH.append(word)
    await message.channel.send(word + " 추가 완료!")


@bot.command()
async def remove(message, *, word):
    boolean = BWH.append(word)
    if boolean:
        await message.channel.send(word + " 삭제 완료!")
    else:
        await message.channel.send("데이터에 없는 단어입니다.")


bot.run(token)