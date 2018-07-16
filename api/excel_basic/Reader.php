<?php

Class Reader {


    public static function readUpload($upload) {
        $filename = $upload['name'];
        $file = $upload['tmp_name'];

        $pathinfo = pathinfo($filename);
        $ext = isset($pathinfo['extension']) ? $pathinfo['extension'] : false;
        try {
            $reader = self::identify($file, $ext);
            $reader->load($file);
            return $reader;
        } catch (Exception $e) {
            return false;
        }
    }

    public static function readFile($filename) {
        $pathinfo = pathinfo($filename);
        $ext = isset($pathinfo['extension']) ? $pathinfo['extension'] : false;
        try {
            $reader = self::identify($filename, $ext);
            $reader->load($filename);
            return $reader;
        } catch (Exception $e) {
            return false;
        }
    }

    public static function identify($file, $ext = false) {
        $extensionType = false;
        if ($ext) {
            switch (strtolower($ext)) {
                case 'xlsx':
                case 'xlsm':
                case 'xltx':
                case 'xltm':
                    $extensionType = 'XLSX';
                    break;
                case 'xls':    //	Excel (BIFF) Spreadsheet
                case 'xlt':    //	Excel (BIFF) Template
                    $extensionType = 'XLS';
                    break;
                case 'txt':
                case 'csv':
                    $extensionType = 'CSV';
                    break;
                default:
                    $ext = false;
            }
            if ($extensionType) {
                $reader = self::createReader($extensionType);
                if ($reader && $reader->canRead($file)) {
                    return $reader;
                }
            }
        }

        //Ok default we could not identify::
        foreach (array('XLS', 'XLSX', 'CSV') as $ext) {
            $reader = self::createReader($ext);
            if ($reader && $reader->canRead($file)) {
                return $reader;
            }
        }

        //Ok here Not Readable - Throw exception
        throw new Exception('Unable to identify a reader for this file');
    }

    public static function createReader($type) {
        $cname = ucfirst(strtolower($type));
        return new $cname();
    }

}