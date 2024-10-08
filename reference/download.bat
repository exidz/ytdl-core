@echo off
setlocal

set youtubejs=https://github.com/LuanRT/YouTube.js
set ytdlp=https://github.com/yt-dlp/yt-dlp

for /f "tokens=*" %%i in ('powershell -command "Invoke-RestMethod https://api.github.com/repos/LuanRT/YouTube.js/releases/latest | Select-Object -ExpandProperty tag_name"') do set youtubejs_folder-name=YouTube.js_%%i
for /f "tokens=*" %%j in ('powershell -command "Invoke-RestMethod https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest | Select-Object -ExpandProperty tag_name"') do set ytdlp_folder-name=yt-dlp_%%j

:first

echo [36m1[0m：LuanRT/YouTube.js のみを GitHub からクローンします。
echo [36m2[0m：yt-dlp/yt-dlp のみを GitHub からクローンします。
echo [36m3[0m：上記の両方を GitHub からクローンします。
echo 以上の3つから実行したい処理を番号で入力：
set /p process=

if "%process%" == "1" (
    goto youtubejs
)

if "%process%" == "2" (
    goto ytdlp
)

if "%process%" == "3" (
    goto all
)

echo [33m【注意】[0m 入力できる値は「1」「2」「3」のいずれかです。
echo.
goto first

:youtubejs
call :delete-youtubejs-folder

call git clone %youtubejs% %youtubejs_folder-name%
goto end

:ytdlp
call :delete-ytdlp-folder

call git clone %ytdlp% %ytdlp_folder-name%
goto ytdlp-postprocess

:all
call :delete-youtubejs-folder
call :delete-ytdlp-folder

call git clone %youtubejs% %youtubejs_folder-name%
echo.
call git clone %ytdlp% %ytdlp_folder-name%
goto ytdlp-postprocess

:end
echo.
echo [32m【成功】[0m クローン処理は正常に完了しました。

pause
exit

:ytdlp-postprocess

cd %ytdlp_folder-name%
rmdir /s /q test
cd yt_dlp
cd extractor
for %%f in (*) do (
    if not "%%f"=="youtube.py" (
        del "%%f"
    )
)

goto end

:delete-youtubejs-folder
for /d %%D in (YouTube.js*) do (
    if exist %%D (
        rmdir /s /q %%D
        echo [32m【成功】[0m （YouTube.js）既存のフォルダは正常に削除されました。
    )
)

:delete-ytdlp-folder
for /d %%D in (yt-dlp*) do (
    if exist %%D (
        rmdir /s /q %%D
        echo [32m【成功】[0m （yt-dlp）既存のフォルダは正常に削除されました。
    )
)