import discord
import os
import asyncio
import sys
import datetime
import urllib
import urllib.request
import ast

app = discord.Client()
now = datetime.datetime.now()

token = "NTg3MjYzODM1MDY5NjEyMDM1.XP0COw.9sBjTNUX4CxTrTOEiMQSL1O6Kkc"

@app.event
async def on_ready():
    print("Filtering 봇! 다음으로 로그인 합니다 : ")
    print(app.user.name)
    print(app.user.id)
    print("============")
        
@app.event
async def on_message(message):
    now = datetime.datetime.now()
    try:
        if message.content == "live":
            if message.author.id == "383801854003511296":
                embed=discord.Embed(title="[Manual] Filter Bot is live ", color=0xf1f1f1)
                embed.add_field(name="This Check is", value="`%s/%s월/%s일` | `%s:%s:%s`" % (now.year, now.month, now.day, now.hour, now.minute, now.second), inline=True)
                embed.set_footer(text = "Let's Filtering Warring Word")
                await app.send_message(message.channel, embed=embed)
                

        if message.content == "봇 종료":
            if message.author.id == "383801854003511296":
                await app.send_message(message.channel,'(위이잉..) 댓글 청정모드를 종료하는 중입니다.' % (message.author.id))
                exit()
            else:
                return None

        if message.author.bot:
            return None

        if message.content == "링크단축":
            await app.send_message(message.channel, "네이버 api를 이용하여 URL을 단축합니다. 취소하려면 '취소'를 입력하세요")
            mes = await app.wait_for_message(author=message.author)
            if mes.content == "취소":
                await app.send_message(message.channel, "url 단축을 를 취소했어요.")
                return
            #elif mes.content[0:3] != "http":
            #    await app.send_message(message.channel, "올바른 링크 형식이 아닙니다. http로 시작하는 링크를 입력하세요")
            #    return

            elif mes.content[0:4] != "http":
                print(mes.content[0:3])
                print(mes.content)
                await app.send_message(message.channel, "앗 이것은 링크가 아닙니다.. 올바른 링크를 입력해주세요. 재시도 하시려면 `*링크단축`를 눌러주세요.")
            else:
                #mes = mes.content
                #short_url = str(naver_url(mes))
                #await app.send_message(message.channel, "링크 생성 완료\n```{url}```".format(url=short_url))        
                client_id = "YNuWw05iIwfQcBByL9mP" # 개발자센터에서 발급받은 Client ID 값
                client_secret = "JOo0DND97B" # 개발자센터에서 발급받은 Client Secret 값
                encText = urllib.parse.quote(mes.content) #"https://developers.naver.com/docs/utils/shortenurl"
                data = "url=" + encText
                url = "https://openapi.naver.com/v1/util/shorturl"
                request = urllib.request.Request(url)
                request.add_header("X-Naver-Client-Id",client_id)
                request.add_header("X-Naver-Client-Secret",client_secret)
                response = urllib.request.urlopen(request, data=data.encode("utf-8"))
                response = urllib.request.urlopen(request, data=data.encode("utf-8"))
                rescode = response.getcode()
                response_body = response.read()
                middle_url = response_body.decode('utf-8')
                final_url = middle_url#["url"]
                final_url = final_url[51:]
                check_point = final_url.find('"')
                print_url = final_url[0:check_point]
                print_url.replace('"',"")

                if rescode == 200:
                    await app.send_message(message.channel, "링크 생성 완료 : [ {url} ] ".format(url=print_url))
                else:
                    await app.send_message(message.channel, "링크 생성 실패 Error Code:" + rescode)

        #필터링 구문
        
        
        if message.channel.id == "587266535249412105":
            find_num = 1
            if message.content.startswith("."):
                return None
            else:
                embed = discord.Embed(title="언어감지결과 보고", description=None, color=0xf1f1f1)

                checkword = None
                mes = message.content
                checkwords = ["바보","멍충이","똥개"] #탐지할 단어
                for checkword in checkwords: #checkword에 탐지할 단어 하나씩 대입
                    if mes.find(checkword) != -1: #mes.find가 -1을 감지하지 않음(checkword가 들어가있지 않으면 -1을 반환)
                        embed.add_field(name="비속어 감지됨" + str(find_num) + "번째", value="비속어 감지함\n감지한 단어 : "+checkword, inline=True)
                        find_num = find_num + 1
                        
                    

                client_id = "GI1zRloL1UAJt2VhhSz1"
                client_secret = "NSzR2athhh"
                encQuery = urllib.parse.quote(mes)
                data = "query=" + encQuery
                url = "https://openapi.naver.com/v1/papago/detectLangs"
                request = urllib.request.Request(url)
                request.add_header("X-Naver-Client-Id",client_id)
                request.add_header("X-Naver-Client-Secret",client_secret)
                response = urllib.request.urlopen(request, data=data.encode("utf-8"))
                rescode = response.getcode()
                if(rescode==200):
                    response_body = response.read()
                    temp = ast.literal_eval(response_body.decode('utf-8'))
                    lg = temp["langCode"]
                    if lg == "ko":
                        lg_a = "한국어"
                    elif lg == "en":
                        lg_a = "영어"
                    elif lg == "unk":
                        lg_a = "알 수 없음"
                    else:
                        lg_a = "영어"

                    embed.add_field(name="언어 감지 API 결과", value="입력한 문장 : `{mes}`\nAPI에서 반환한 결과 : `{lg}`\n변환된 결과 : `{lg_a}`".format(mes=mes,lg=lg,lg_a=lg_a), inline=True)
                    await app.send_message(message.channel, embed=embed)
                else:
                    print("Error Code:" + rescode)
                    await app.send_message(message.channel, "언어 감지 실패 : rescode")
                    await app.send_message(message.channel, embed=embed)

                            

    except Exception as e:
        e = str(e)
        await app.send_message(message.channel, "오류 : `" + e + "`")
        print("errer : " + e)

app.run(token)